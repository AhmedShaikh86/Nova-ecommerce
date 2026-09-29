import "dotenv/config";

const isProd = process.env.NODE_ENV === "production";

function required(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  isProd,
  port: Number(process.env.PORT) || 4000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  mongoUri: process.env.MONGODB_URI || "",
  jwtAccessSecret: required("JWT_ACCESS_SECRET", isProd ? undefined : "dev-access-secret"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET", isProd ? undefined : "dev-refresh-secret"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  adminEmail: process.env.ADMIN_EMAIL || "admin@nova.dev",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@12345",
};

if (isProd && !env.mongoUri) {
  throw new Error("MONGODB_URI is required in production");
}
