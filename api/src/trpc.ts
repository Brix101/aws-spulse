import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res });

type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();
export const publicProcedure = t.procedure;
export const protectProcedure = t.procedure.use(async (opts) => {
  // const { ctx } = opts;
  // if (!ctx.req.cookies.id && !ctx.req.cookies.rid) {
  //   throw new TRPCError({ code: "UNAUTHORIZED" });
  // }
  //
  // const { id, rid } = ctx.req.cookies;
  //
  // const { userId, user } = await checkTokens(id, rid);
  //
  // ctx.userId = userId;
  // if (user) {
  //   sendAuthCookies(ctx.res, user);
  // }

  return opts.next(opts);
});