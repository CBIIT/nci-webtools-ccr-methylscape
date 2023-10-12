import Router from "express-promise-router";
import path from "path";
import { check } from "express-validator";
import { requiresRouteAccessPolicy } from "../auth/policyMiddleware.js";
import { getFile } from "../aws.js";
import multer from "multer";
import DiskStorage from "../storage.js";

const router = Router();
const storage = new DiskStorage({
  filename: (req, file) => file.originalname,
  destination: (req) => path.resolve("../data/", req.params.id),
});
const upload = multer({ storage });
const validate = check("id").isUUID();

router.get("/submissions", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const { roleName, organizationId, id } = request.user;
  const { id: submissionsId } = request.query;

  let query = connection("submissions")
    .leftJoin("user", "submissions.userId", "user.id")
    .leftJoin("organization", "submissions.organizationId", "organization.id")
    .leftJoin("userSamples", "submissions.id", "userSamples.submissionsId")
    .select(
      "submissions.*",
      "organization.name as organizationName",
      connection.raw(`"user"."firstName" || ' ' || "user"."lastName" as submitter`),
      connection.raw(`count("userSamples"."id") as "sampleCount"`),
      connection.raw(`array_agg("userSamples"."sample") as "samples"`),
      connection.raw(`array_agg("userSamples"."sentrixId") as "sentrixIds"`),
      connection.raw(`array_agg("userSamples"."sentrixPosition") as "sentrixPositions"`)
    )
    .groupBy(["submissions.id", "user.id", "organization.name", "userSamples.submissionsId"])
    .orderBy("submissions.createdAt", "desc");

  if (submissionsId) {
    query = query.where("submissions.id", submissionsId);
  }

  if (roleName == "Admin") {
    response.json(await query);
  } else if (roleName == "Data Manager") {
    response.json(await query.where("submissions.organizationId", organizationId));
  } else if (roleName == "User") {
    response.json(await query.where("submissions.userId", id));
  } else {
    return [];
  }
});

router.post(
  "/submissions/:id",
  requiresRouteAccessPolicy("AccessApi"),
  validate,
  upload.array("sampleFiles"),
  async (request, response) => {
    const { connection } = request.app.locals;
    if (request.body?.data) {
      const { submission, metadata } = JSON.parse(request.body.data);
      const submissionsId = (await connection("submissions").insert(submission).returning("id"))[0].id;
      const userSamplesId = metadata.map(
        async (sample) =>
          await connection("userSamples")
            .insert({ submissionsId, ...sample })
            .returning("id")
      );
      response.json({ submissionsId, userSamplesId });
    } else {
      response.json(true);
    }
  }
);

router.get("/submissions/sample/:submissionsId", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
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

router.get("/submissions/data/:submissionsId", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { submissionsId } = request.params;
  const { filePath } = request.query;
  const { S3_USER_DATA_BUCKET, S3_USER_DATA_BUCKET_KEY_PREFIX } = process.env;
  const path = ["submissions", submissionsId, filePath].join("/");
  try {
    const results = await getFile(path, S3_USER_DATA_BUCKET, S3_USER_DATA_BUCKET_KEY_PREFIX);
    response.setHeader("Content-Type", results.ContentType);
    response.setHeader("Content-Length", results.ContentLength);
    response.setHeader("Content-Disposition", `attachment; filename=${filePath.split("/").pop()}`);
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // do not cache the file in the browser
    results.Body.pipe(response);
  } catch (error) {
    console.log(error);
    response.status(404).send("Submission data not found");
  }
});

export default router;
