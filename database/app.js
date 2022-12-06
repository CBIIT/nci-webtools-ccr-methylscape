import { createRequire } from "module";
import { S3Client } from "@aws-sdk/client-s3";
import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";
import { transports } from "winston";
import { importData } from "./startDatabaseImport.js";
import { createLogger } from "./services/logger.js";

const require = createRequire(import.meta.url);
const schema = require("./schema.json");
const sources = require("./samples.json");

const s3Client = new S3Client();
const ssmClient = new SSMClient();

export async function handler() {
  await loadConfig([
    `/analysistools/${process.env.TIER}/sumologic/`,
    `/analysistools/${process.env.TIER}/methylscape/`,
  ]);
  const {
    S3_DATA_BUCKET,
    S3_DATA_BUCKET_KEY_PREFIX,
    LOG_LEVEL,
    LOG_ENDPOINT_HOST,
    LOG_ENDPOINT_URI,
    LOG_ENDPOINT_PORT,
  } = process.env;

  const sourcePath = `s3://${S3_DATA_BUCKET}/${S3_DATA_BUCKET_KEY_PREFIX}`;
  const sourceProvider = new S3Provider(s3Client, sourcePath);
  const logger = createLogger("methylscape-data-import", LOG_LEVEL, [
    new transports.Console(),
    new transports.Http({
      host: LOG_ENDPOINT_HOST,
      port: LOG_ENDPOINT_PORT,
      path: LOG_ENDPOINT_URI,
    }),
    new CustomTransport(),
  ]);
  return await importData(process.env, schema, sources, sourceProvider, logger);
}

async function loadConfig(keyPrefixes) {
  for (const keyPrefix of keyPrefixes) {
    const parameters = await getParameters(ssmClient, keyPrefix);
    for (let parameter of parameters) {
      const { Name, Value } = parameter;
      const key = Name.replace(keyPrefix, "").toUpperCase();
      process.env[key] = Value;
    }
  }
}

async function getParameters(client, prefix) {
  const command = new GetParametersByPathCommand({ Path: prefix, Recursive: true, WithDecryption: true });
  const results = await client.send(command);
  return results.Parameters;
}
