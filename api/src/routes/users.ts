import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { Argon2id } from "oslo/password";
import { z } from "zod";

import { User, users } from "../schema/users";
import { publicProcedure } from "../trpc";
import {
  checkTokens,
  clearAuthCookies,
  sendAuthCookies,
} from "../utils/auth-token";
import { omitUserField } from "../utils/omitUserFields";

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

export const userRoutes = {
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
            }
          ),
      })
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
            .returning()
        )[0] as User;

        sendAuthCookies(ctx.res, newUser);
        return { user: omitUserField(newUser) };
      } catch (e: any) {
        if (
          e.message.includes(
            'duplicate key value violates unique constraint "users_email_unique"'
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
    const { id, rid } = ctx.req.cookies;

    try {
      const { user: maybeUser, userId } = await checkTokens(id, rid);

      if (maybeUser) {
        return { user: omitUserField(maybeUser) };
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      return { user: user ? omitUserField(user) : null };
    } catch {
      return { user: null };
    }
  }),
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email.toString()),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      try {
        const valid = await argon2id.verify(user.passwordHash, input.password);
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
      return { user: omitUserField(user) };
    }),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    clearAuthCookies(ctx.res);

    return {
      ok: true,
    };
  }),
} satisfies TRPCRouterRecord;
