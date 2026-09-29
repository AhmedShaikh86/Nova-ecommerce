import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { router } from "./routes";
import { errorHandler, notFound } from "./middleware/error";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  if (!env.isProd) app.use(morgan("dev"));

  app.use("/api", router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
