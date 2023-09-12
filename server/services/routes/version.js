import Router from "express-promise-router";

const router = Router();

router.get("/version", (request, response) => {
  response.json({
    version: process.env.VERSION || null,
    commit: process.env.COMMIT || null,
  });
});

export default router;
