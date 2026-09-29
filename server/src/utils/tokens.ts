import jwt, { type SignOptions } from "jsonwebtoken";
import type { CookieOptions } from "express";
import { env } from "../config/env";
import type { UserRole } from "../models/User";

export interface AccessPayload {
  sub: string;
  role: UserRole;
}

export interface RefreshPayload {
  sub: string;
  v: number;
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshPayload;
}

export const REFRESH_COOKIE = "nova_rt";

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
