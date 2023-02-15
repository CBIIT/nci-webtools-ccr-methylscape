import { fileURLToPath } from "url";
import { createRequire } from "module";
import minimist from "minimist";
import { config } from "dotenv";
import { createPostgresClient } from "./services/utils.js";
import { createSchema } from "./services/pipeline.js";

// determine if this script was launched from the command line
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);
config();

if (isMainModule) {
  const args = minimist(process.argv.slice(2));
  const schema = await require(args.schema || "./schema.json");

  const connection = await createPostgresClient(process.env);
  await createSchema({ connection, schema });
  console.log("Initialized all tables");
  process.exit(0);
}
