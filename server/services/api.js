import express from "express";
import Router from "express-promise-router";
import { logErrors, logRequests } from "./middleware.js";
import adminRouter from "./routes/admin.js";
import analysisRouter from "./routes/analysis.js";
import healthcheckRouter from "./routes/healthcheck.js";
import organizationsRouter from "./routes/organizations.js";
import sessionRouter from "./routes/session.js";
import usersRouter from "./routes/users.js";
import rolesRouter from "./routes/roles.js";

export const apiRouter = Router();

// parse json requests
apiRouter.use(express.json());

// log requests
apiRouter.use(logRequests());

// register routes
apiRouter.use("/admin", adminRouter);
apiRouter.use("/analysis", analysisRouter);
apiRouter.use(healthcheckRouter);
apiRouter.use(organizationsRouter);
apiRouter.use(usersRouter);
apiRouter.use(rolesRouter);
apiRouter.use(sessionRouter);

// log errors
apiRouter.use(logErrors());
