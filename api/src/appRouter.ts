import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { userRoutes } from "./routes/users";
import { createContext, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRoutes,
});

export const app = express();
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

export type AppRouter = typeof appRouter;
