import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import { z } from "zod";
import { sendAuthCookies } from "../../utils/auth-token";
import { users } from "../../schema/users";
import { publicProcedure } from "../../trpc";
import { db } from "../../db";

export const register = publicProcedure
  .input(
    z.object({
      name: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(6),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const newUser = (
        await db
          .insert(users)
          .values({
            name: input.name,
            email: input.email.toLowerCase(),
            passwordHash: await argon2.hash(input.password),
          })
          .returning()
      )[0];

      sendAuthCookies(ctx.res, newUser);

      return { user: newUser };
    } catch (e: any) {
      if (
        e.message.includes(
          'duplicate key value violates unique constraint "users_email_unique"',
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: e.message,
      });
    }
  });
