import Router from "express-promise-router";
import { requiresRouteAccessPolicy } from "../auth/policyMiddleware.js";

const router = Router();

router.post("/organizations", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const organization = request.body;
  const results = await connection("organization").insert(organization).returning("id");
  response.json(results);
});

router.get("/organizations", async (request, response) => {
  const { connection } = request.app.locals;
  const results = await connection("organization").orderBy(["order", "name"]);
  response.json(results);
});

router.get("/organizations/:id", async (request, response) => {
  const { connection } = request.app.locals;
  const { id } = request.params;
  const results = await connection("organization").where({ id });
  response.json(results);
});

router.put("/organizations/:id", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const { id } = request.params;
  const organization = { ...request.body, id, updatedAt: new Date() };
  const results = await connection("organization").where({ id }).update(organization);
  response.json(results);
});

router.delete("/organizations/:id", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { connection } = request.app.locals;
  const { id } = request.params;
  const results = await connection("organization").where({ id }).delete();
  response.json(results);
});

export default router;
