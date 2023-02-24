import Router from "express-promise-router";
import passport from "passport";

const router = Router();

router.get(
  "/login",
  (request, response, next) => {
    const destination = request.query.destination || "/";
    passport.authenticate("default", {
      failureRedirect: "/api/login",
      state: "0".repeat(22) + destination,
    })(request, response, next);
  },
  (request, response) => {
    request.session.expires = request.session.cookie.expires;
    const destination = request.query.state?.slice(22) || "/";
    response.redirect(destination);
  }
);

router.get("/logout", (request, response) => {
  request.logout(() => response.redirect("/"));
});

router.get("/session", (request, response) => {
  const { session } = request;
  if (session.passport?.user) {
    response.json({
      authenticated: true,
      expires: session.expires,
      user: request.user,
    });
  } else {
    response.json({ authenticated: false });
  }
});

router.post("/session", (request, response) => {
  const { session } = request;
  if (session.passport?.user) {
    session.touch();
    session.expires = session.cookie.expires;
    response.json({
      authenticated: true,
      expires: session.expires,
      user: request.user,
    });
  } else {
    response.json({ authenticated: false });
  }
});

export default router;
