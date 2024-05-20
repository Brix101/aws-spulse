import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createContext, router } from "./trpc";
import { userRoutes } from "./routes/users";

export const appRouter = router({
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
