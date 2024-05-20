import { publicProcedure } from "src/trpc";
import { clearAuthCookies } from "src/utils/auth-token";
import { z } from "zod";

export const logout = publicProcedure
  .input(z.object({}))
  .mutation(async ({ ctx }) => {
    clearAuthCookies(ctx.res);

    return {
      ok: true,
    };
  });
