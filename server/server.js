import express from "express";
import passport from "passport";
import {
  createUserSerializer,
  createUserDeserializer,
  createDefaultAuthStrategy,
} from "./services/auth/passportUtils.js";
import { createSession } from "./services/session.js";
import { createLogger } from "./services/logger.js";
import { apiRouter } from "./services/api.js";
import { isMainModule } from "./services/utils.js";
import { createConnection } from "./services/database.js";
import { validateEnvironment } from "./services/environment.js";
import UserManager from "./services/auth/userManager.js";

// if this module is the main module, start the app
if (isMainModule(import.meta)) {
  try {
    const env = process.env;
    validateEnvironment(env);
    await startApp(env);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

export async function startApp(env) {
  const { PORT } = env;
  const app = await createApp(env);
  const logger = app.locals.logger;
  logger.debug("Created application, starting server");
  app.listen(PORT, () => logger.info(`Application is running on port: ${PORT}`));
}

export async function createApp(env) {
  // create app and register locals/middlware
  const app = express();

  // create services
  const logger = createLogger("methylscape", env.LOG_LEVEL);
  const connection = createConnection(env);
  const userManager = new UserManager(connection);

  // register services as locals
  app.locals.logger = logger;
  app.locals.connection = connection;
  app.locals.userManager = userManager;

  // configure passport
  logger.debug("Configuring passport");
  passport.serializeUser(createUserSerializer());
  passport.deserializeUser(createUserDeserializer(userManager));
  passport.use("default", await createDefaultAuthStrategy(env));

  // configure session
  logger.debug("Configuring session");
  app.use(createSession(env));
  app.use(passport.initialize());
  app.use(passport.session());

  // register api routes
  app.use("/api", apiRouter);

  return app;
}
