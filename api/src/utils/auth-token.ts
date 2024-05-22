import jsonwebtoken from "jsonwebtoken";
import { Response } from "express";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { User, users } from "../schema/users";
import { db } from "../db";

export type RefreshTokenPayload = {
  userId: string;
  refreshTokenVersion?: number;
};

export type AccessTokenPayload = {
  userId: string;
};

const createAuthTokens = (
  user: User,
): { refreshToken: string; accessToken: string } => {
  const refreshToken = jsonwebtoken.sign(
    { userId: user.id, refreshTokenVersion: user.refreshTokenVersion },
    "process.env.REFRESH_TOKEN_SECRET",
    {
      expiresIn: "30d",
    },
  );
  const accessToken = jsonwebtoken.sign(
    { userId: user.id },
    "process.env.ACCESS_TOKEN_SECRET",
    {
      expiresIn: "15min",
    },
  );

  return { refreshToken, accessToken };
};

const cookieOpts = {
  path: "/",
  httpOnly: true,
  // secure: __prod__,
  // domain: __prod__ ? `.${process.env.DOMAIN}` : "",
  maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 year
};

export const sendAuthCookies = (res: Response, user: User) => {
  const { accessToken, refreshToken } = createAuthTokens(user);
  res.cookie("id", accessToken, cookieOpts);
  res.cookie("rid", refreshToken, cookieOpts);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("id", cookieOpts);
  res.clearCookie("rid", cookieOpts);
};

export const checkTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  try {
    const data = <AccessTokenPayload>(
      jsonwebtoken.verify(accessToken, "process.env.ACCESS_TOKEN_SECRET")
    );
    return {
      userId: data.userId,
    };
  } catch {}

  if (!refreshToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  let data;
  try {
    data = <RefreshTokenPayload>(
      jsonwebtoken.verify(refreshToken, "process.env.REFRESH_TOKEN_SECRET")
    );
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, data.userId),
  });

  if (!user || user.refreshTokenVersion !== data.refreshTokenVersion) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return {
    userId: data.userId,
    user,
  };
};
