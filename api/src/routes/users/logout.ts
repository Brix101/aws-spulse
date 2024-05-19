import { publicProcedure } from "@/trpc";
import { clearAuthCookies } from "@/utils/auth-token";
import { z } from "zod";

export const logout = publicProcedure
  .input(z.object({}))
  .mutation(async ({ ctx }) => {
    clearAuthCookies(ctx.res);

    return {
      ok: true,
    };
  });
