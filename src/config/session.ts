import "dotenv/config";
import { CookieOptions } from "express";

const DEFAULT_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const configuredTtl = Number(process.env.SESSION_TTL_SECONDS);

export const SESSION_TTL_SECONDS =
  Number.isInteger(configuredTtl) && configuredTtl > 0
    ? configuredTtl
    : DEFAULT_SESSION_TTL_SECONDS;

const isProduction = process.env.NODE_ENV === "production";

export const SESSION_COOKIE_NAME = isProduction
  ? "__Host-session"
  : "session";

export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};
