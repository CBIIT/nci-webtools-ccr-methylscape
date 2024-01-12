import { createReadStream, createWriteStream, existsSync } from "fs";
import { writeFile, readdir, mkdir } from "fs/promises";
import { join, relative, normalize } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { S3Client, GetObjectCommand, PutObjectCommand, paginateListObjectsV2 } from "@aws-sdk/client-s3";
import knex from "knex";
import { config } from "dotenv";
import { format } from "@fast-csv/format";

const execFileAsync = promisify(execFile);

const [jobId] = process.argv.slice(2);
config();

if (!jobId) {
  console.error("No jobId specified");
  process.exit(1);
}

try {
  await runClassifier(jobId);
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}

async function runClassifier(jobId, env = process.env) {
  console.log("Running classifier for job", jobId);
  const s3Client = new S3Client();
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

  try {
    await connection.update({ status: "Classifying" }).where({ id: jobId }).into("submissions");
    await downloadS3Folder(
      s3Client,
      env.S3_USER_DATA_BUCKET,
      `${env.S3_USER_DATA_BUCKET_KEY_PREFIX}bethesda_classifier_v2/input/${jobId}/`,
      "/input"
    );
    if (!existsSync("/input/Sample_Sheet.csv")) await generateSampleSheet(connection, jobId);
    const { stdout, stderr } = await execFileAsync("Rscript", ["Bv2_light_pipeline.R"], { cwd: env.JOB_INPUT_FOLDER });
    console.log(stdout);
    console.log(stderr);
    await connection.update({ status: "Completed" }).where({ id: jobId }).into("submissions");
  } catch (error) {
    console.error(error);
    await connection.update({ status: "Failed" }).where({ id: jobId }).into("submissions");
  } finally {
    await uploadS3Folder(
      s3Client,
      env.S3_USER_DATA_BUCKET,
      `${env.S3_USER_DATA_BUCKET_KEY_PREFIX}bethesda_classifier_v2/output/${jobId}/`,
      "/output"
    );
  }
}

export async function downloadS3Folder(s3Client, s3Bucket, s3KeyPrefix, folder) {
  await mkdir(folder, { recursive: true });
  const s3ListObjectsPaginator = paginateListObjectsV2({ client: s3Client }, { Bucket: s3Bucket, Prefix: s3KeyPrefix });

  // download files from s3
  for await (const page of s3ListObjectsPaginator) {
    const items = page.Contents;
    for (const item of items) {
      const fileName = item.Key.replace(s3KeyPrefix, "");
      const filePath = join(folder, fileName);

      // if the item is a file, download it
      if (fileName?.length > 0 && item.Size > 0) {
        const params = {
          Bucket: s3Bucket,
          Key: item.Key,
        };
        console.log(`Downloading ${item.Key} to ${filePath}`);
        const { Body } = await s3Client.send(new GetObjectCommand(params));
        await writeFile(filePath, Body);
      } else {
        // if the item is a folder, create it
        await mkdir(filePath, { recursive: true });
      }
    }
  }
}

export async function uploadS3Folder(s3Client, s3Bucket, s3KeyPrefix, folder) {
  // get files in folder
  await mkdir(folder, { recursive: true });
  const files = await readdir(folder, { recursive: true, withFileTypes: true });

  // upload files to s3
  for (const file of files) {
    if (file.isDirectory()) continue;
    const filepath = relative(folder, file.path);
    const s3Key = normalize(s3KeyPrefix + [filepath, file.name].filter(Boolean).join("/"));
    console.log(`Uploading ${file.name} to ${s3Key}`);
    const fileStream = createReadStream(join(file.path, file.name));
    const params = {
      Bucket: s3Bucket,
      Key: s3Key,
      Body: fileStream,
    };
    await s3Client.send(new PutObjectCommand(params));
  }
}

async function generateSampleSheet(connection, jobId) {
  const samples = await connection
    .select("sample", "sentrixId", "sentrixPosition", "sex", "materialType")
    .from("userSamples")
    .where({ submissionsId: jobId });
  const file = createWriteStream("/input/Sample_Sheet.csv");
  const fastcsv = format({ headers: ["Sample_Name", "Sentrix_ID", "Sentrix_Position", "Gender", "Material_Type"] });
  for (let i = 0; i < 7; i++) {
    file.write("\r\n");
  }
  fastcsv.pipe(file);
  samples.forEach((e) => fastcsv.write(Object.values(e)));
  fastcsv.end();
}
