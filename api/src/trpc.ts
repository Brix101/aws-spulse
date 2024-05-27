import { TRPCError, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import superjson from "superjson";
import { ZodError } from "zod";

import { COOKIE_KEY } from "./constant";
import { db } from "./db";
import { checkTokens, sendAuthCookies } from "./utils/auth-token";

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

  const {
    [COOKIE_KEY.ACCESS]: accessCookie,
    [COOKIE_KEY.REFRESH]: refreshCookie,
  } = ctx.req.cookies;

  if (!accessCookie && !refreshCookie) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const { userId, user } = await checkTokens(accessCookie, refreshCookie);

  ctx.userId = userId;
  if (user) {
    await sendAuthCookies(ctx.res, user);
  }

  return opts.next(opts);
});
