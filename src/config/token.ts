import "dotenv/config";
import { CookieOptions } from "express";

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const ACCESS_TOKEN_TTL_SECONDS = parsePositiveInteger(
  process.env.ACCESS_TOKEN_TTL_SECONDS,
  10 * 60,
);

export const REFRESH_TOKEN_TTL_SECONDS = parsePositiveInteger(
  process.env.REFRESH_TOKEN_TTL_SECONDS,
  7 * 24 * 60 * 60,
);

export const ACCESS_TOKEN_ISSUER =
  process.env.ACCESS_TOKEN_ISSUER ?? "achievable-api";

export const ACCESS_TOKEN_AUDIENCE =
  process.env.ACCESS_TOKEN_AUDIENCE ?? "achievable-api";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

if (!accessTokenSecret) {
  throw new Error("ACCESS_TOKEN_SECRET is not configured");
}

if (
  process.env.NODE_ENV === "production" &&
  Buffer.byteLength(accessTokenSecret, "utf8") < 32
) {
  throw new Error("ACCESS_TOKEN_SECRET must contain at least 32 bytes");
}

export const ACCESS_TOKEN_SECRET = accessTokenSecret;

const isProduction = process.env.NODE_ENV === "production";

export const REFRESH_TOKEN_COOKIE_NAME = isProduction
  ? "__Secure-refresh_token"
  : "refresh_token";

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/api/v1/auth",
};
