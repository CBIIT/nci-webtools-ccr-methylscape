import { writeFile } from "fs/promises";
import { promisify } from "util";
import { join } from "path";
import knex from "knex";
import { S3Client, GetObjectCommand, PutObjectCommand, paginateListObjectsV2 } from "@aws-sdk/client-s3";
import { config } from "dotenv";
import { exec } from "child_process";

const execAsync = promisify(exec);

const [jobId] = process.argv.slice(2);
config();

if (!jobId) {
  console.error("No jobId specified");
  process.exit(1);
}

try {
  await runClassifier(jobId);
} catch (e) {
  console.error(e);
  process.exit(1);
}

async function runClassifier(jobId, env = process.env) {
  const s3Client = new S3Client(config);
  const connection = knex({
    client: "pg",
    connection: {
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
    },
  });

  await connection.update({ status: "RUNNING" }).where({ id: jobId }).into("submissions");
  await downloadS3Folder(s3Client, env.S3_BUCKET, `jobs/${jobId}/`, env.JOB_INPUT_FOLDER);
  await execAsync("R", "classifier.R", { cwd: env.JOB_INPUT_FOLDER });
  await uploadS3Folder(s3Client, env.S3_BUCKET, `jobs/${jobId}/`, env.S3_OUTPUT_FOLDER);
  await connection.update({ status: "DONE" }).where({ id: jobId }).into("submissions");
}

async function downloadS3Folder(s3Client, s3Bucket, s3KeyPrefix, folder) {
  const s3ListObjectsPaginator = paginateListObjectsV2({ client: s3Client }, { Bucket: s3Bucket, Prefix: s3KeyPrefix });
  for await (const page of s3ListObjectsPaginator) {
    const items = page.Contents;
    for (const item of items) {
      const getObjectCommand = new GetObjectCommand({
        Bucket: s3Bucket,
        Key: item.Key,
      });
      const { Body } = await s3Client.send(getObjectCommand);
      const fileName = item.Key.replace(s3KeyPrefix, "");
      await writeFile(join(folder, fileName), Body);
    }
  }
}

async function uploadS3Folder(s3Client, s3Bucket, s3KeyPrefix, folder) {
  // get files in folder
  const files = await readdir(folder);

  // upload files to s3
  for (const file of files) {
    const fileStream = createReadStream(join(folder, file));
    const putObjectCommand = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: `${s3KeyPrefix}/${file}`,
      Body: fileStream,
    });
    await s3Client.send(putObjectCommand);
  }
}
