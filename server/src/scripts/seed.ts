// Resets the database and loads sample data: `npm run seed -w server`
import mongoose from "mongoose";
import { env } from "../config/env";
import { seedAll } from "./seedData";

async function run() {
  if (!env.mongoUri) {
    console.error("Set MONGODB_URI in server/.env to seed a persistent database.");
    console.error("(Without it, the dev server uses an in-memory DB that seeds itself.)");
    process.exit(1);
  }
  await mongoose.connect(env.mongoUri);
  await seedAll({ reset: true });
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
