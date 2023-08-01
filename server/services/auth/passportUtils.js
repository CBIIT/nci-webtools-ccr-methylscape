import { createOAuthStrategy, createPkceStrategy } from "./passportStrategies.js";

export function getAccountType({ preferred_username }) {
  const loginDomain = (preferred_username || "").split("@").pop();
  return !preferred_username || loginDomain.endsWith("login.gov") ? "Login.gov" : "NIH";
}

export function createUserSerializer() {
  return (user, done) => done(null, user);
}

export function createUserDeserializer(userManager) {
  return async ({ email, preferred_username }, done) => {
    const accountType = getAccountType({ preferred_username });
    const user = await userManager.getUserForLogin(email, accountType);
    done(null, user || {});
  };
}

export async function createDefaultAuthStrategy(env = process.env) {
  if (env.OAUTH2_CLIENT_SECRET) {
    return await createOAuthStrategy({
      name: "default",
      clientId: env.OAUTH2_CLIENT_ID,
      clientSecret: env.OAUTH2_CLIENT_SECRET,
      baseUrl: env.OAUTH2_BASE_URL,
      redirectUris: [env.OAUTH2_REDIRECT_URI],
      params: {
        scope: "openid profile email",
        prompt: "login",
      },
    });
  } else {
    return await createPkceStrategy({
      name: "default",
      clientId: env.OAUTH2_CLIENT_ID,
      baseUrl: env.OAUTH2_BASE_URL,
      redirectUris: [env.OAUTH2_REDIRECT_URI],
      params: {
        scope: "openid profile email",
        acr_values: env.OAUTH2_ACR_VALUES,
        // prompt: "login",
      },
    });
  }
}
