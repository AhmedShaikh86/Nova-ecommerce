import mongoose from "mongoose";
import { env } from "./env";
import { seedIfEmpty } from "../scripts/seedData";

// Serverless entry (Vercel): reuse one connection per warm instance instead of
// reconnecting on every request. Kept separate from db.ts so the in-memory
// MongoDB dev dependency is never bundled into the function.
let connection: Promise<void> | null = null;

export function connectMongo(): Promise<void> {
  if (!connection) {
    if (!env.mongoUri) throw new Error("MONGODB_URI is required");
    connection = mongoose
      .connect(env.mongoUri, { serverSelectionTimeoutMS: 10_000 })
      .then(() => seedIfEmpty())
      .catch((err) => {
        connection = null;
        throw err;
      });
  }
  return connection;
}
