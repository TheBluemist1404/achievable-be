import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  SESSION_TTL_SECONDS,
} from "@/config/session";
import { Request, Response } from "express";

export const getSessionCookie = (req: Request): string | null => {
  const token: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  return typeof token === "string" && token.length > 0 ? token : null;
};

export const setSessionCookie = (res: Response, token: string): void => {
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_TTL_SECONDS * 1000,
  });
};

export const clearSessionCookie = (res: Response): void => {
  res.clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);
};
