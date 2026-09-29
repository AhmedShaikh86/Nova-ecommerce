import mongoose from "mongoose";
import { env } from "./env";
import { seedIfEmpty } from "../scripts/seedData";

let memoryServer: { stop: () => Promise<boolean> } | null = null;

export async function connectDB(): Promise<void> {
  let uri = env.mongoUri;

  if (!uri) {
    // Dev convenience: spin up an in-memory MongoDB so the app runs without a local install.
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const server = await MongoMemoryServer.create();
    memoryServer = server;
    uri = server.getUri("nova");
    console.log("⚠️  MONGODB_URI not set — using in-memory MongoDB (data resets on restart)");
  }

  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  await seedIfEmpty();
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
