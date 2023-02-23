import { formatObject } from "./logger.js";

const isProduction = process.env.NODE_ENV === "production";

export function publicCacheControl(maxAge) {
  return (request, response, next) => {
    if (request.method === "GET") response.set("Cache-Control", `public, max-age=${maxAge}`);
    next();
  };
}

export function logRequests(formatter = (request) => [request.path, { ...request.query, ...request.body }]) {
  return (request, response, next) => {
    const { logger } = request.app.locals;
    request.startTime = new Date().getTime();
    logger.info(formatter(request));
    next();
  };
}

export function logErrors(formatter = (e) => ({ error: e.message })) {
  return (error, request, response, next) => {
    const { logger } = request.app.locals;
    logger.error(formatObject(error));
    response.status(400).json(formatter(error));
  };
}

export function withAsync(fn) {
  return async (request, response, next) => {
    try {
      return await fn(request, response, next);
    } catch (error) {
      next(error);
    }
  };
}
