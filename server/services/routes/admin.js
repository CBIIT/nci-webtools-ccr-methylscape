import Router from "express-promise-router";
import { getImportLogs } from "../query.js";
import { requiresRouteAccessPolicy } from "../auth/policyMiddleware.js";
import { startDataImport } from "../database.js";

const router = Router();

router.get("/importLogs", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const results = await getImportLogs(connection, request.query);
  response.json(results);
});

router.post("/importData", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const results = await startDataImport(connection, process.env);
  response.json(results);
});

export default router;
