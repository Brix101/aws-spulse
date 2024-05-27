import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { Response } from "express";

import { TimeSpan } from "oslo";
import { serializeCookie } from "oslo/cookie";
import { createJWT, validateJWT } from "oslo/jwt";
import { COOKIE_KEY } from "src/constant";
import { env } from "src/env.mjs";
import { db } from "../db";
import { User, users } from "../schema/users";

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
  const refreshToken = await createJWT(
    "ES256",
    env.REFRESH_PRIVATE_KEY,
    { email: user.email },
    {
      expiresIn: new TimeSpan(30, "d"),
      // notBefore: createDate(refreshTime),
      issuer: "example.com",
      subject: user.id,
      // audiences,
      includeIssuedTimestamp: true,
    }
  );

  const accessToken = await createJWT(
    "ES256",
    env.ACCESS_PRIVATE_KEY,
    {},
    {
      expiresIn: new TimeSpan(15, "m"),
      issuer: "example.com",
      subject: user.id,
      // audiences,
      includeIssuedTimestamp: true,
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
  res.cookie(COOKIE_KEY.ACCESS, "", { ...cookieOpts, maxAge: -1 });
  res.cookie(COOKIE_KEY.REFRESH, "", { ...cookieOpts, maxAge: -1 });
};

export const checkTokens = async (
  accessToken: string,
  refreshToken: string
) => {
  try {
    const jwt = await validateJWT("ES256", env.ACCESS_PUBLIC_KEY, accessToken);
    const payload = jwt.payload as AccessTokenPayload;

    return {
      userId: jwt.subject ?? payload.sub,
    };
  } catch {}

  if (!refreshToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  let data: RefreshTokenPayload = { sub: "", refreshTokenVersion: 0 };
  try {
    const jwt = await validateJWT(
      "ES256",
      env.REFRESH_PUBLIC_KEY,
      refreshToken
    );
    data = jwt.payload as RefreshTokenPayload;
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, data.sub),
  });

  if (!user || user.refreshTokenVersion !== data.refreshTokenVersion) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return {
    userId: data.sub,
    user,
  };
};
