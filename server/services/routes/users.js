import Router from "express-promise-router";
import { requiresRouteAccessPolicy } from "../auth/policyMiddleware.js";
import { sendNotification } from "../notifications.js";
const { BASE_URL, EMAIL_SENDER } = process.env;

const router = Router();

router.get("/users", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { userManager } = request.app.locals;
  const results = await userManager.getUsers();
  response.json(results);
});

router.post("/user", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { userManager } = request.app.locals;
  const user = {
    ...request.body,
    name: request.body.email,
    roleId: null,
    status: "pending",
  };
  const results = await userManager.addUser(user);
  response.json(results);
});

router.get("/user/:id(\\d+)", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { userManager } = request.app.locals;
  const { id } = request.params;
  const results = await userManager.getUser(id);
  response.json(results);
});

router.put("/user/:id(\\d+)", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { userManager } = request.app.locals;
  const { id } = request.params;
  const user = { ...request.body, id, updatedAt: new Date() };
  const results = await userManager.updateUser(user);
  await sendNotification({
    userManager,
    from: EMAIL_SENDER,
    to: results.email,
    subject: "Methylscape User Account Updated",
    templateName: "user-profile-update.html",
    params: {
      firstName: results.firstName,
      lastName: results.lastName,
      roleName: results.roleName,
      organizationName: [results.organizationName, results.organizationId === 1 && `(${results.organizationOther})`]
        .filter(Boolean)
        .join(" "),
      status: results.status,
    },
  });
  response.json(results);
});

router.delete("/user/:id(\\d+)", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { userManager } = request.app.locals;
  const { id } = request.params;
  const results = await userManager.removeUser(id);
  response.json(results);
});

router.post("/user/register", async (request, response) => {
  const { userManager } = request.app.locals;
  const user = {
    ...request.body,
    name: request.body.email,
    roleId: null,
    status: "pending",
  };
  const results = await userManager.addUser(user);

  // send email to user
  await sendNotification({
    userManager,
    from: EMAIL_SENDER,
    to: results.email,
    subject: "Methylscape User Account - Confirmation",
    templateName: "user-registration-confirmation.html",
    params: {
      firstName: results.firstName,
      lastName: results.lastName,
    },
  });

  // send emails to admins
  await sendNotification({
    userManager,
    from: EMAIL_SENDER,
    roleName: "Admin",
    subject: "Methylscape User Account - Review Required",
    templateName: "admin-user-registration-review.html",
    params: {
      userLastName: results.lastName,
      userFirstName: results.firstName,
      userEmail: results.email,
      userJustification: results.justification,
      organizationName: [results.organizationName, results.organizationId === 1 && `(${results.organizationOther})`]
        .filter(Boolean)
        .join(" "),
      baseUrl: BASE_URL,
    },
  });

  response.json(results);
});

router.post("/user/approve", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { userManager } = request.app.locals;
  const user = {
    id: request.body.id,
    roleId: request.body.roleId,
    organizationId: request.body.organizationId,
    status: "active",
    updatedAt: new Date(),
  };
  const results = await userManager.updateUser(user);
  await sendNotification({
    userManager,
    from: EMAIL_SENDER,
    to: results.email,
    subject: "Methylscape Registration Approved",
    templateName: "user-registration-approval.html",
    params: {
      firstName: results.firstName,
      lastName: results.lastName,
      baseUrl: BASE_URL,
    },
  });
  response.json(results);
});

router.post("/user/reject", requiresRouteAccessPolicy("AccessApi"), async (request, response) => {
  const { userManager } = request.app.locals;
  const user = {
    id: request.body.id,
    notes: request.body.notes,
    status: "rejected",
    updatedAt: new Date(),
  };
  const results = await userManager.updateUser(user);
  await sendNotification({
    userManager,
    from: EMAIL_SENDER,
    to: results.email,
    subject: "Methylscape Registration Rejected",
    templateName: "user-registration-rejection.html",
    params: {
      firstName: results.firstName,
      lastName: results.lastName,
      notes: results.notes,
    },
  });
  response.json(results);
});

export default router;
