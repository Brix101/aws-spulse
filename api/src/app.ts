import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import express from "express";
import path from "path";

import { db } from "./db";
import { env } from "./env";
import { appRouter } from "./routes";
import { createContext } from "./trpc";

const app = express();

app.use(
  "/trpc",
  cors({
    maxAge: 86400,
    credentials: true,
    origin: "*",
  }),
  cookieParser(),
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

export const startServer = async () => {
  console.log("about to migrate postgres");
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  console.log("postgres migration complete");

  const server = app.listen(env.PORT, () => {
    console.log(`server started on http://localhost:${env.PORT}/trpc`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received.");
    console.log("Closing http server.");
    server.close((err) => {
      console.log("Http server closed.");
      process.exit(err ? 1 : 0);
    });
  });
};
