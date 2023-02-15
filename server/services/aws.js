import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
const { S3_DATA_BUCKET, S3_DATA_BUCKET_KEY_PREFIX } = process.env;

export async function getFile(key) {
  const s3Client = new S3Client();
  const bucketParams = { Bucket: S3_DATA_BUCKET, Key: S3_DATA_BUCKET_KEY_PREFIX + key };
  return await s3Client.send(new GetObjectCommand(bucketParams));
}

export async function getKey(prefix) {
  const s3Client = new S3Client();
  const params = { Bucket: S3_DATA_BUCKET, Prefix: prefix };
  const objects = await s3Client.send(new ListObjectsV2Command(params));
  return objects;
}
