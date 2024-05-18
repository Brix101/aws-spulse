import { publicProcedure, t } from "./trpc";
import { z } from "zod";
import { count } from "./appRouter";

export const appRouter = t.router({
  hello: publicProcedure.input(z.string().optional()).query((opts) => {
    return { message: `Hello ${opts.input ?? "World"}` };
  }),
  count: publicProcedure.query(() => {
    return count;
  }),
  add: publicProcedure.mutation(async () => {
    count++;
    return count;
  }),
  minus: publicProcedure.mutation(async () => {
    count--;
    return count;
  }),

  login,
  register,
});
