import Router from "express-promise-router";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { getImportLogs } from "../query.js";
import { requiresRouteAccessPolicy } from "../auth/policyMiddleware.js";
const { LAMBDA_DATA_IMPORT_FUNCTION } = process.env;

const router = Router();

router.get("/importLogs", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const results = await getImportLogs(connection, request.query);
  response.json(results);
});

router.post("/importData", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const client = new LambdaClient();
  const input = {
    FunctionName: LAMBDA_DATA_IMPORT_FUNCTION,
    Payload: JSON.stringify(request.body),
  };
  const command = new InvokeCommand(input);
  const results = await client.send(command);
  response.json(results);
});

export default router;
