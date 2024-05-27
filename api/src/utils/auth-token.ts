import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { ECDSA, HMAC } from "oslo/crypto";

import fs from "fs";
import { TimeSpan } from "oslo";
import { serializeCookie } from "oslo/cookie";
import { createJWT, validateJWT } from "oslo/jwt";
import path from "path";
import { db } from "../db";
import { User, users } from "../schema/users";

export type RefreshTokenPayload = {
  userId: string;
  refreshTokenVersion?: number;
};

export type AccessTokenPayload = {
  userId: string;
};

const refreshSecret = await new HMAC("SHA-256").generateKey();

const es256 = new ECDSA("SHA-256", "P-256");

const { publicKey: accessPublicKey, privateKey: accessPrivateKey } =
  await es256.generateKeyPair();

const { publicKey: refreshPublicKey, privateKey: refreshPrivateKey } =
  await es256.generateKeyPair();

const accessPublicKeyStr = Buffer.from(accessPublicKey).toString("base64");
const accessPrivateKeyStr = Buffer.from(accessPrivateKey).toString("base64");

const refreshPublicKeyStr = Buffer.from(refreshPublicKey).toString("base64");
const refreshPrivateKeyStr = Buffer.from(refreshPrivateKey).toString("base64");

const envPath = path.join(process.cwd(), ".env");

fs.writeFileSync(
  envPath,
  `REFRESH_PUBLIC_KEY=${refreshPublicKeyStr}\nREFRESH_PRIVATE_KEY=${refreshPrivateKeyStr}\nACCESS_PUBLIC_KEY=${accessPublicKeyStr}\nACCESS_PRIVATE_KEY=${accessPrivateKeyStr}`
);

const createAuthTokens = async (
  user: User
): Promise<{ refreshToken: string; accessToken: string }> => {
  const refreshToken = await createJWT(
    "HS256",
    refreshSecret,
    { userId: user.id, sub: user.id, email: user.email },
    {
      headers: {
        // kid
      },
      expiresIn: new TimeSpan(30, "d"),
      issuer: "example.com",
      // subject,
      // audiences,
      includeIssuedTimestamp: true,
    }
  );

  const accessToken = await createJWT(
    "ES256",
    Buffer.from(accessPrivateKeyStr, "base64"),
    { userId: user.id },
    {
      headers: {
        // kid
      },
      expiresIn: new TimeSpan(1, "m"),
      issuer: "example.com",
      // subject,
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
  maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 year
  // sameSite: "lax",
};

export const sendAuthCookies = async (res: Response, user: User) => {
  const { accessToken, refreshToken } = await createAuthTokens(user);

  const accessSerialized = serializeCookie("id", accessToken, cookieOpts);
  const refreshSerialized = serializeCookie("rid", refreshToken, cookieOpts);

  res.setHeader("Set-Cookie", [accessSerialized, refreshSerialized]);
};

export const clearAuthCookies = (res: Response) => {
  res.cookie("id", "", { ...cookieOpts, maxAge: -1 });
  res.cookie("rid", "", { ...cookieOpts, maxAge: -1 });
};

export const checkTokens = async (
  accessToken: string,
  refreshToken: string
) => {
  console.log({ accessToken, refreshToken });

  try {
    const accessTest = await validateJWT(
      "ES256",
      Buffer.from(accessPublicKeyStr, "base64"),
      accessToken
    );
    console.log(accessTest);
  } catch (error) {
    console.log(error);
  }

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
