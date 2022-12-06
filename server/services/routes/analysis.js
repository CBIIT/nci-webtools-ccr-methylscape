import Router from "express-promise-router";
import { requiresRouteAccessPolicy } from "../auth/policyMiddleware.js";
import { getSurvivalData } from "../analysis/r.js";
import {
  getSamples,
  getSampleCoordinates,
  getGenes,
  getCnvBins,
  getCnvSegments,
  getallproject,
  getExperiments,
  getAllSamples,
  getUnifiedProject,
} from "../query.js";

const router = Router();

router.get("/samples", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const results = await getSampleCoordinates(connection, request.query);
  response.json(results);
});

router.post("/samples", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const results = await getSamples(connection, request.body);
  response.json(results);
});

router.get("/allproject", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const results = await getallproject(connection);
  response.json(results);
});

router.get("/unifiedproject", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const results = await getUnifiedProject(connection);
  response.json(results);
});

router.get("/experiment", async (request, response) => {
  const { connection } = request.app.locals;
  const results = await getExperiments(connection);
  response.json(results);
});

router.get("/allsample", async (request, response) => {
  const { connection } = request.app.locals;
  const results = await getAllSamples(connection);
  response.json(results);
});

router.get("/genes", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const results = await getGenes(connection);
  response.json(results);
});

router.get("/cnv/segments", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const { idatFilename } = request.query;
  const results = await getCnvSegments(connection, { idatFilename });
  response.json(results);
});

router.get("/cnv/bins", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const { idatFilename } = request.query;
  const results = await getCnvBins(connection, { idatFilename });
  response.json(results);
});

router.post("/survival", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const results = await getSurvivalData(request.body);
  response.json(results);
});

export default router;
