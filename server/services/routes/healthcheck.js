import Router from "express-promise-router";

const router = Router();

// healthcheck route
router.get("/ping", async (request, response) => {
  const { connection } = request.app.locals;
  await connection.raw("SELECT 1");
  response.json(true);
});

export default router;
