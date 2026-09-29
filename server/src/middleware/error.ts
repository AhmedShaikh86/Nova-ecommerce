import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = "Something went wrong";
  let details: unknown;

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    message = "Validation failed";
    details = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (typeof err === "object" && err && (err as { code?: number }).code === 11000) {
    status = 409;
    const field = Object.keys((err as { keyValue?: object }).keyValue ?? {})[0] ?? "field";
    message = `A record with this ${field} already exists`;
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    message,
    ...(details !== undefined && { details }),
    ...(!env.isProd && status >= 500 && err instanceof Error && { stack: err.stack }),
  });
}
