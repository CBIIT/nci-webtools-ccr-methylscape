import knex from "knex";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";

export function createConnection(env = process.env) {
  return knex({
    client: "pg",
    connection: {
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
    },
  });
}

export async function startDataImport(connection, env = process.env) {
  const { ECS_CLUSTER, SUBNET_IDS, SECURITY_GROUP_IDS, ECS_DATA_IMPORT_TASK } = env;
  const ecsClient = new ECSClient();

  await connection("importLog").returning("id").insert({ status: "PENDING" });
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
    taskDefinition: ECS_DATA_IMPORT_TASK,
  });
  return await ecsClient.send(runTaskCommand);
}
