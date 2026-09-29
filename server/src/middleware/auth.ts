import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/tokens";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) throw new AppError(401, "Authentication required");

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") throw new AppError(403, "Admin access required");
  next();
}
