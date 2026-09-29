import type { Request, Response } from "express";
import { z } from "zod";
import { User, type UserDocument } from "../models/User";
import { AppError } from "../utils/AppError";
import {
  REFRESH_COOKIE,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const loginSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(128).optional(),
  })
  .refine((d) => !d.newPassword || d.currentPassword, {
    message: "Current password is required to set a new password",
    path: ["currentPassword"],
  });

const clearCookieOptions = { ...refreshCookieOptions, maxAge: undefined };

function issueTokens(res: Response, user: UserDocument) {
  const refreshToken = signRefreshToken({ sub: user.id, v: user.tokenVersion });
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  return signAccessToken({ sub: user.id, role: user.role });
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  if (await User.exists({ email: data.email })) {
    throw new AppError(409, "An account with this email already exists");
  }
  const user = await User.create(data);
  const accessToken = issueTokens(res, user);
  res.status(201).json({ user, accessToken });
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, "Invalid email or password");
  }
  const accessToken = issueTokens(res, user);
  res.json({ user, accessToken });
}

export async function refresh(req: Request, res: Response) {
  const token: string | undefined = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new AppError(401, "No refresh token");

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
    throw new AppError(401, "Invalid refresh token");
  }

  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.v) {
    res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
    throw new AppError(401, "Session expired");
  }

  const accessToken = issueTokens(res, user);
  res.json({ user, accessToken });
}

export async function logout(req: Request, res: Response) {
  const token: string | undefined = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      // Invalidate every outstanding refresh token for this user.
      await User.updateOne({ _id: payload.sub }, { $inc: { tokenVersion: 1 } });
    } catch {
      // Token already invalid — nothing to revoke.
    }
  }
  res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
  res.status(204).end();
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError(404, "User not found");
  res.json({ user });
}

export async function updateMe(req: Request, res: Response) {
  const data = updateProfileSchema.parse(req.body);
  const user = await User.findById(req.user!.id).select("+password");
  if (!user) throw new AppError(404, "User not found");

  if (data.name) user.name = data.name;
  if (data.newPassword) {
    if (!(await user.comparePassword(data.currentPassword!))) {
      throw new AppError(400, "Current password is incorrect");
    }
    user.password = data.newPassword;
  }
  await user.save();
  res.json({ user });
}
