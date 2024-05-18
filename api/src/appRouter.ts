import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { getMe } from "./routes/users/getMe";
import { login } from "./routes/users/login";
import { logout } from "./routes/users/logout";
import { register } from "./routes/users/register";
import { createContext, t } from "./trpc";

export const appRouter = t.router({
  login,
  register,
  getMe,
  logout,
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
