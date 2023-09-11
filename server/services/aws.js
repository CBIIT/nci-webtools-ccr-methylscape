import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
const { S3_DATA_BUCKET, S3_DATA_BUCKET_KEY_PREFIX } = process.env;

export async function getFile(key, bucket = S3_DATA_BUCKET, prefix = S3_DATA_BUCKET_KEY_PREFIX) {
  const s3Client = new S3Client();
  const bucketParams = { Bucket: bucket, Key: prefix + key };
  return await s3Client.send(new GetObjectCommand(bucketParams));
}

export async function getKey(prefix, bucket = S3_DATA_BUCKET) {
  const s3Client = new S3Client();
  const params = { Bucket: bucket, Prefix: prefix };
  const objects = await s3Client.send(new ListObjectsV2Command(params));
  return objects;
}
