import Router from "express-promise-router";
import { requiresRouteAccessPolicy } from "../auth/policyMiddleware.js";

const router = Router();

router.post("/roles", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const role = request.body;
  const results = await connection("role").insert(role).returning("id");
  response.json(results);
});

router.get("/roles", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const results = await connection("role");
  response.json(results);
});

router.get("/roles/:id", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const { id } = request.params;
  const results = await connection("role").where({ id });
  response.json(results);
});

router.put("/roles/:id", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const { id } = request.params;
  const role = { ...request.body, id };
  const results = await connection("role").where({ id }).update(role);
  response.json(results);
});

router.delete("/roles/:id", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const { id } = request.params;
  const results = await connection("role").where({ id }).delete();
  response.json(results);
});

export default router;
