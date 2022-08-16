const { Router } = require("express");
const { createImportRequest } = require("../database.js");
const { getImportLogs } = require("../query.js");
const { withAsync } = require("../middleware");
const { requiresRouteAccessPolicy } = require("../auth/policyMiddleware");
const config = require("../../config.json");

const router = Router();

router.get(
  "/importLogs",
  requiresRouteAccessPolicy("AccessApi"),
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const results = await getImportLogs(connection, request.query);
    response.json(results);
  })
);

router.post(
  "/importData",
  requiresRouteAccessPolicy("AccessApi"),
  withAsync(async (request, response) => {
    const { connection } = request.app.locals;
    const { sqsName } = config.aws;
    const { forceRecreate } = request.body;
    const results = await createImportRequest(connection, sqsName, { forceRecreate });
    response.json(results);
  })
);

module.exports = router;
