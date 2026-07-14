import ENV from "../utils/env.js";

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  if (ENV.server.node_env === "development") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
