import { TRPCRouterRecord } from "@trpc/server";

import { protectProcedure } from "../trpc";

export const userRoutes = {
  getMe: protectProcedure.query(async ({ ctx }) => {
    try {
      return { user: ctx.userId };
    } catch {
      return { user: null };
    }
  }),
} satisfies TRPCRouterRecord;
