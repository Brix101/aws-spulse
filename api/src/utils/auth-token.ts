import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { Response } from "express";

import { TimeSpan } from "oslo";
import { serializeCookie } from "oslo/cookie";
import { COOKIE_KEY } from "src/constant";
import { db } from "../db";
import { User, users } from "../schema/users";
import { signJwt, verifyJwt } from "./jwt-util";

export type RefreshTokenPayload = {
  sub: string;
  refreshTokenVersion?: number;
};

export type AccessTokenPayload = {
  sub: string;
};

const createAuthTokens = async (
  user: User
): Promise<{ refreshToken: string; accessToken: string }> => {
  const refreshToken = await signJwt(
    "REFRESH_PRIVATE_KEY",
    { email: user.email, refreshTokenVersion: user.refreshTokenVersion },
    { expiresIn: new TimeSpan(30, "d"), subject: user.id }
  );

  const accessToken = await signJwt(
    "ACCESS_PRIVATE_KEY",
    {},
    {
      expiresIn: new TimeSpan(15, "m"),
      subject: user.id,
    }
  );

  return { refreshToken, accessToken };
};

const cookieOpts = {
  path: "/",
  httpOnly: true,
  // secure: __prod__,
  // domain: __prod__ ? `.${process.env.DOMAIN}` : "",
  // maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 year
  // sameSite: "lax",
};

export const sendAuthCookies = async (res: Response, user: User) => {
  const { accessToken, refreshToken } = await createAuthTokens(user);

  const serializes = [
    serializeCookie(COOKIE_KEY.ACCESS, accessToken, cookieOpts),
    serializeCookie(COOKIE_KEY.REFRESH, refreshToken, cookieOpts),
  ];

  res.setHeader("Set-Cookie", serializes);
};

export const clearAuthCookies = (res: Response) => {
  const clearCookieOptions = { ...cookieOpts, maxAge: -1 };

  res.cookie(COOKIE_KEY.ACCESS, "", clearCookieOptions);
  res.cookie(COOKIE_KEY.REFRESH, "", clearCookieOptions);
};

export const checkTokens = async (
  accessToken: string,
  refreshToken: string
) => {
  const accessJwt = await verifyJwt("ACCESS_PUBLIC_KEY", accessToken);

  if (accessJwt) {
    const accessPayload = accessJwt.payload as AccessTokenPayload;
    return {
      userId: accessJwt.subject ?? accessPayload.sub,
    };
  }

  if (!refreshToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const refreshJwt = await verifyJwt("REFRESH_PUBLIC_KEY", refreshToken);
  if (!refreshJwt) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const refreshPayload = refreshJwt.payload as RefreshTokenPayload;
  const user = await db.query.users.findFirst({
    where: eq(users.id, refreshPayload.sub),
  });

  if (
    !user ||
    user.refreshTokenVersion !== refreshPayload.refreshTokenVersion
  ) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return {
    userId: refreshPayload.sub,
    user,
  };
};
