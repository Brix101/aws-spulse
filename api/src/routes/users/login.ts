import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import argon2d from "argon2";
import { publicProcedure } from "@/trpc";
import { users } from "@/schema/users";
import { sendAuthCookies } from "@/utils/auth-token";

export const login = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.email, input.email.toString()),
    });

    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user not found",
      });
    }

    try {
      const valid = await argon2d.verify(user.passwordHash, input.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });
      }
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: err.message,
      });
    }

    sendAuthCookies(ctx.res, user);
    return { user };
  });
