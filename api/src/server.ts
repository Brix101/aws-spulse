import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import express from "express";
import path from "path";

import { db } from "./db";
import { userRoutes } from "./routes/users";
import { createContext, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: userRoutes,
});

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

  const server = app.listen(4000, () => {
    console.log("server started on http://localhost:4000/trpc");
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
