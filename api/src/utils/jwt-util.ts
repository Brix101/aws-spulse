import { createJWT, validateJWT } from "oslo/jwt";
import { env } from "../env.mjs";

type CreateJwtFunction = typeof createJWT;
type OptionsType = Parameters<CreateJwtFunction>[3];

type PrivateKeys = {
  [K in keyof typeof env as K extends `${string}PRIVATE${string}`
    ? K
    : never]: (typeof env)[K];
};

type PayloadClaims = Record<any, any>;

export async function signJwt(
  keyName: keyof PrivateKeys,
  payloadClaims: PayloadClaims,
  options?: OptionsType
) {
  const keyStr = env[keyName];
  const privateKey = Buffer.from(keyStr, "base64");

  const token = await createJWT("ES256", privateKey, payloadClaims, {
    issuer: "example.com",
    includeIssuedTimestamp: true,
    ...(options && options),
  });

  return token;
}

//? Get only the keys that has a public key
type PublicKeys = {
  [K in keyof typeof env as K extends `${string}PUBLIC${string}`
    ? K
    : never]: (typeof env)[K];
};

export async function verifyJwt(keyName: keyof PublicKeys, token: string) {
  const keyStr = env[keyName];
  const publicKey = Buffer.from(keyStr, "base64");

  try {
    const jwt = await validateJWT("ES256", publicKey, token);

    return jwt;
  } catch {
    return null;
  }
}
