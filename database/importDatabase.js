import { createPostgresClient } from "./services/utils.js";
import { runTask } from "./services/pipeline.js";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import minimist from "minimist";
import { config } from "dotenv";
import { withDuration } from "./services/utils.js";
import { LocalProvider } from "./services/providers/localProvider.js";
import { S3Provider } from "./services/providers/s3Provider.js";
import { createLogger } from "./services/logger.js";
import { S3Client } from "@aws-sdk/client-s3";

// determine if this script was launched from the command line
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);
config();

if (isMainModule) {
  const args = minimist(process.argv.slice(2));
  const schema = require(args.schema || "./schema.json");
  const sources = require(args.sources || "./samples.json");
  const providerName = args.provider || "local";
  const providerArgs = [...args._];

  const connection = await createPostgresClient(process.env);
  const sourceProvider = getSourceProvider(providerName, providerArgs);
  const logger = createLogger("import");
  await importDatabase(connection, schema, sources, sourceProvider, logger);
  process.exit(0);
}

export async function importDatabase(connection, schema, sources, sourceProvider, logger) {
  let { results, duration } = await withDuration(async () => {
    await connection.query("begin");
    let rowCount = 0;
    for (const task of sources) {
      logger.info(task.description);
      const taskArgs = { ...task, schema, connection, sourceProvider };
      const results = await runTask(taskArgs);
      if (results?.rowCount) {
        logger.info(`${results.rowCount} rows imported`);
        rowCount += results?.rowCount || 0;
      }
    }
    await connection.query("commit");
    return rowCount;
  });

  const statusMessage = `Finished importing ${results} rows in ${duration.toFixed(2)}s (${Math.round(
    results / duration
  )} rows/s)`;
  logger.info(statusMessage);
}

export function getSourceProvider(providerName, providerArgs) {
  switch (providerName) {
    case "local":
      return new LocalProvider(...providerArgs);
    case "s3":
      return new S3Provider(new S3Client(), ...providerArgs);
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}
