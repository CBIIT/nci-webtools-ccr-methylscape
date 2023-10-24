import Router from "express-promise-router";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { check } from "express-validator";
import { requiresRouteAccessPolicy } from "../auth/policyMiddleware.js";
import { getFile } from "../aws.js";
import multer from "multer";

const router = Router();
const upload = multer(); // do not store files on disk
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
    const { files } = request;
    const { connection, logger } = request.app.locals;
    console.log;
    const { S3_USER_DATA_BUCKET, S3_USER_DATA_BUCKET_KEY_PREFIX } = process.env;

    // upload request files to s3 bucket
    const s3Client = new S3Client();

    for (const file of files) {
      const [name, extension] = file.originalname.split(".");
      const s3ObjectName = /\.csv$/i.test(extension) ? "Sample_Sheet.csv" : file.originalname;
      const s3ObjectKey = `${S3_USER_DATA_BUCKET_KEY_PREFIX}bethesda_classifier_v2/input/${request.body.submissionsId}/${s3ObjectName}`;
      logger.info(`Uploading ${file.originalname} to s3://${S3_USER_DATA_BUCKET}/${s3ObjectKey}`);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_USER_DATA_BUCKET,
          Key: s3ObjectKey,
          Body: file.buffer,
        })
      );
    }

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

router.get(
  "/submissions/run-classifier/:submissionsId",
  requiresRouteAccessPolicy("AccessApi"),
  async (request, response) => {
    const { ECS_CLUSTER, SUBNET_IDS, SECURITY_GROUP_IDS, ECS_CLASSIFIER_TASK } = process.env;
    if (ECS_CLASSIFIER_TASK) {
      const ecsClient = new ECSClient();
      const runTaskCommand = new RunTaskCommand({
        cluster: ECS_CLUSTER,
        count: 1,
        launchType: "FARGATE",
        networkConfiguration: {
          awsvpcConfiguration: {
            securityGroups: SECURITY_GROUP_IDS.split(","),
            subnets: SUBNET_IDS.split(","),
          },
        },
        taskDefinition: ECS_CLASSIFIER_TASK,
        overrides: {
          containerOverrides: [
            {
              name: "classifier",
              command: ["node", "classifier.js", request.params.submissionsId],
            },
          ],
        },
      });
      const status = await ecsClient.send(runTaskCommand);
      response.json(status);
    } else {
      response.status(404).send("Classifier task not found");
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

router.get("/submissions/data/", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { submissionsId } = request.params;
  const { filePath } = request.query;
  const { S3_USER_DATA_BUCKET, S3_USER_DATA_BUCKET_KEY_PREFIX } = process.env;
  const path = ["submissions", submissionsId, filePath].join("/");
  try {
    const results = await getFile(filePath, S3_USER_DATA_BUCKET, S3_USER_DATA_BUCKET_KEY_PREFIX);
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
