import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "./db";
import { checkAuthCookies, sendAuthCookies } from "./utils/auth-token";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  return { req, res, db, userId: "" };
};

type Context = Awaited<ReturnType<typeof createContext>> & {
  db: typeof db;
  userId: string;
};

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;

  const { userId, user } = await checkAuthCookies(ctx.req.cookies);

  ctx.userId = userId;
  if (user) {
    await sendAuthCookies(ctx.res, user);
  }

  return opts.next(opts);
});
