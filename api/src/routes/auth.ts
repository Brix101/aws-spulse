import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { Argon2id } from "oslo/password";
import { z } from "zod";

import { users } from "../schema/users";
import { publicProcedure } from "../trpc";
import {
  checkAuthCookies,
  clearAuthCookies,
  sendAuthCookies,
} from "../utils/auth-token";

const argon2id = new Argon2id();

export const signInSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/, {
      message:
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
    }),
});

export const authRoutes = {
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(3),
        email: z.string().email({
          message: "Please enter a valid email address",
        }),
        password: z
          .string()
          .min(8, {
            message: "Password must be at least 8 characters long",
          })
          .max(100)
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
            {
              message:
                "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
            },
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newUser = (
          await ctx.db
            .insert(users)
            .values({
              name: input.name,
              email: input.email.toLowerCase(),
              passwordHash: await argon2id.hash(input.password),
            })
            .returning({
              id: users.id,
              email: users.email,
              name: users.name,
              refreshTokenVersion: users.refreshTokenVersion,
            })
        )[0];

        await sendAuthCookies(ctx.res, newUser ?? {});
        return { user: newUser ?? null };
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
    }),
  getMe: publicProcedure.query(async ({ ctx }) => {
    try {
      const { user: maybeUser, userId } = await checkAuthCookies(
        ctx.req.cookies,
      );

      if (maybeUser) {
        return { user: maybeUser };
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          id: true,
          email: true,
          name: true,
        },
      });

      return { user: user ?? null };
    } catch {
      return { user: null };
    }
  }),
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ ctx, input }) => {
      const dUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email.toString()),
        columns: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          refreshTokenVersion: true,
        },
      });

      if (!dUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const { passwordHash, ...user } = dUser;

      try {
        const valid = await argon2id.verify(passwordHash, input.password);
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

      await sendAuthCookies(ctx.res, user);
      return { user };
    }),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    clearAuthCookies(ctx.res);

    return {
      ok: true,
    };
  }),
} satisfies TRPCRouterRecord;
