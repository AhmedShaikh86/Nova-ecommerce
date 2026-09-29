// Vercel serverless entry: every request is rewritten here (see vercel.json).
// Local development still uses src/index.ts.
import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../src/app";
import { connectMongo } from "../src/config/mongo";

const app = createApp();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await connectMongo();
  } catch (err) {
    console.error("Database connection failed:", err);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Database unavailable" }));
    return;
  }
  app(req, res);
}
