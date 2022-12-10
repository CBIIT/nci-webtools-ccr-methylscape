export const requiredVariables = [
  "PORT",
  "BASE_URL",
  "SESSION_MAX_AGE",
  "SESSION_SECRET",
  "LOG_LEVEL",
  "DATABASE_HOST",
  "DATABASE_PORT",
  "DATABASE_USER",
  "DATABASE_NAME",
  "S3_DATA_BUCKET",
  "S3_DATA_BUCKET_KEY_PREFIX",
  "EMAIL_SENDER",
  "EMAIL_SMTP_HOST",
  "EMAIL_SMTP_PORT",
  "OAUTH2_CLIENT_ID",
  "OAUTH2_BASE_URL",
  "OAUTH2_REDIRECT_URI",
];

export function validateEnvironment(env = process.env, required = requiredVariables) {
  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
}
