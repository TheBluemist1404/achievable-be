import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "@/config/token";
import { Request, Response } from "express";

export const getRefreshTokenCookie = (req: Request): string | null => {
  const token: unknown = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  return typeof token === "string" && token.length > 0 ? token : null;
};

export const setRefreshTokenCookie = (
  res: Response,
  token: string,
  expiresInSeconds: number,
): void => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    ...REFRESH_TOKEN_COOKIE_OPTIONS,
    maxAge: expiresInSeconds * 1000,
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS);
};
