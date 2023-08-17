import Router from "express-promise-router";
import path from "path";
import { requiresRouteAccessPolicy } from "../auth/policyMiddleware.js";
import multer from "multer";
import DiskStorage from "../storage.js";

const router = Router();
const storage = new DiskStorage({
  filename: (req, file) => file.originalname,
  destination: (req) => path.resolve("../data/"),
});
const upload = multer({ storage });

router.get("/submissions", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const { roleName, organizationId, id } = request.user;

  const query = connection("submissions")
    .leftJoin("user", "submissions.userId", "user.id")
    .leftJoin("organization", "submissions.organizationId", "organization.id")
    .select(
      "submissions.*",
      "organization.name as organizationName",
      connection.raw(`"user"."firstName" || ' ' || "user"."lastName" as submitter`)
    )
    .orderBy("submissions.createdAt", "desc");

  if (roleName == "Admin") {
    response.json(await query);
  } else if (roleName == "Data Manager") {
    response.json(await query.where("organizationId", organizationId));
  } else if (roleName == "User") {
    response.json(await query.where("userId", id));
  } else {
    return [];
  }
});

router.post(
  "/submissions/:uuid",
  requiresRouteAccessPolicy("AccessApi"),
  upload.array("sampleFiles"),
  async (request, response) => {
    const { connection } = request.app.locals;
    const { submission, metadata, ...rest } = JSON.parse(request.body.data);

    const submissionsId = (await connection("submissions").insert(submission).returning("id"))[0].id;
    const userSamplesId = metadata.map(
      async (sample) =>
        await connection("userSamples")
          .insert({ submissionsId, ...sample })
          .returning("id")
    );

    response.json({ submissionsId, userSamplesId });
  }
);

router.get("/userSamples/:submissionsId", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const { submissionsId } = request.params;

  const results = await connection("userSamples")
    .leftJoin("submissions", "userSamples.submissionsId", "submissions.id")
    .leftJoin("user", "submissions.userId", "user.id")
    .leftJoin("organization", "submissions.organizationId", "organization.id")
    .select(
      "userSamples.*",
      "submissions.submissionName",
      "submissions.experiment",
      "submissions.investigator",
      "organization.name as organizationName",
      connection.raw(`"user"."firstName" || ' ' || "user"."lastName" as submitter`)
    )
    .where("submissionsId", submissionsId);

  response.json(results);
});

export default router;
