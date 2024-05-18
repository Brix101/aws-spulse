import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createContext, publicProcedure, t } from "./trpc";
import { z } from "zod";

let count = 0;

export const appRouter = t.router({
  hello: publicProcedure.input(z.string().optional()).query((opts) => {
    return { message: `Hello ${opts.input ?? "World"}` };
  }),
  count: publicProcedure.query(() => {
    return count;
  }),
  add: publicProcedure.mutation(() => {
    count++;
    return count;
  }),
  minus: publicProcedure.mutation(() => {
    count--;
    return count;
  }),
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
