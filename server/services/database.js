import knex from "knex";

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
