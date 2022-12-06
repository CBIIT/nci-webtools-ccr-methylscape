import session from "express-session";
import ConnectSessionKnex from "connect-session-knex";
import { createConnection } from "./database.js";

export const SessionStore = ConnectSessionKnex(session);

export function createSession(env = process.env) {
  return session({
    cookie: {
      maxAge: +env.SESSION_MAX_AGE,
    },
    store: new SessionStore({
      knex: createConnection(env),
    }),
    resave: false,
    secret: env.SESSION_SECRET,
    saveUninitialized: true,
  });
}
