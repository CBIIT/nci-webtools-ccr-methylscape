import { createRequire } from "module";
import { S3Client } from "@aws-sdk/client-s3";
import { SSMClient, paginateGetParametersByPath } from "@aws-sdk/client-ssm";
import { transports } from "winston";
import { importData } from "./startDatabaseImport.js";
import { createLogger } from "./services/logger.js";
import { S3Provider } from "./services/providers/s3Provider.js";
import { CustomTransport } from "./services/transports.js";

const require = createRequire(import.meta.url);
const schema = require("./schema.json");
const sources = require("./samples.json");

const s3Client = new S3Client();
const ssmClient = new SSMClient();

export async function handler(event) {
  await loadConfig([
    `/analysistools/${process.env.TIER}/sumologic/`,
    `/analysistools/${process.env.TIER}/methylscape/`,
  ]);
  const { S3_DATA_BUCKET, S3_DATA_BUCKET_KEY_PREFIX } = process.env;
  const sourcePath = `s3://${S3_DATA_BUCKET}/${S3_DATA_BUCKET_KEY_PREFIX}`;
  const sourceProvider = new S3Provider(s3Client, sourcePath);
  const logger = createCustomLogger("methylscape-data-import", process.env);
  await importData(process.env, schema, sources, sourceProvider, logger);
  return true;
}

function createCustomLogger(name, env = process.env) {
  const { TIER, LOG_LEVEL, LOG_ENDPOINT_HOST, LOG_ENDPOINT_URI, LOG_ENDPOINT_PORT } = env;
  const customTransport = new CustomTransport();
  const logger = createLogger(name, LOG_LEVEL, [
    customTransport,
    new transports.Console(),
    LOG_ENDPOINT_HOST &&
      new transports.Http({
        host: LOG_ENDPOINT_HOST,
        port: LOG_ENDPOINT_PORT,
        path: LOG_ENDPOINT_URI,
        headers: {
          "X-Sumo-Category": `analysistools/${TIER}/methylscape/data-import`,
        },
      }),
  ]);
  logger.customTransport = customTransport;
  return logger;
}

async function loadConfig(keyPrefixes) {
  for (const keyPrefix of keyPrefixes) {
    const parameters = await getParameters(ssmClient, keyPrefix);
    for (const parameter of parameters) {
      const { Name, Value } = parameter;
      const key = Name.replace(keyPrefix, "").toUpperCase();
      process.env[key] = Value;
    }
  }
}

async function getParameters(client, prefix) {
  const paginatorConfig = { client, pageSize: 10 };
  const commandParams = { Path: prefix, Recursive: true, WithDecryption: true };
  const paginator = paginateGetParametersByPath(paginatorConfig, commandParams);
  const results = [];
  for await (const page of paginator) {
    results.push(...page.Parameters);
  }
  return results;
}
