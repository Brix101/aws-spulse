import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { Response } from "express";

import { TimeSpan } from "oslo";
import { serializeCookie } from "oslo/cookie";
import { COOKIE_KEY } from "../constant";
import { db } from "../db";
import { User, users } from "../schema/users";
import { signJwt, verifyJwt } from "./jwt-util";

export type RefreshTokenPayload = {
  sub: string;
  refreshTokenVersion?: number;
};

const signAuthTokens = async (user: Partial<User>) => {
  const refreshToken = await signJwt(
    "REFRESH_PRIVATE_KEY",
    {
      email: user.email,
      refreshTokenVersion: user.refreshTokenVersion,
    },
    {
      expiresIn: new TimeSpan(30, "d"),
      subject: user.id,
    }
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

export const sendAuthCookies = async (res: Response, user: Partial<User>) => {
  const { accessToken, refreshToken } = await signAuthTokens(user);

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

export const checkAuthCookies = async (cookieRecord: Record<string, any>) => {
  const {
    [COOKIE_KEY.ACCESS]: accessToken,
    [COOKIE_KEY.REFRESH]: refreshToken,
  } = cookieRecord;

  if (!accessToken && !refreshToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const accessJwt = await verifyJwt("ACCESS_PUBLIC_KEY", accessToken);

  if (accessJwt) {
    const accessPayload = accessJwt.payload;
    return {
      userId: accessJwt.subject ?? accessPayload.sub,
    };
  }

  if (!refreshToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const refreshJwt = await verifyJwt<RefreshTokenPayload>(
    "REFRESH_PUBLIC_KEY",
    refreshToken
  );

  if (!refreshJwt) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const refreshPayload = refreshJwt.payload;
  const userSub = refreshJwt.subject ?? refreshPayload.sub;
  const dUser = await db.query.users.findFirst({
    where: eq(users.id, userSub),
    columns: {
      id: true,
      email: true,
      name: true,
      refreshTokenVersion: true,
    },
  });

  if (!dUser) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const { refreshTokenVersion, ...user } = dUser;

  if (refreshTokenVersion !== refreshPayload.refreshTokenVersion) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return {
    userId: refreshPayload.sub,
    user,
  };
};
