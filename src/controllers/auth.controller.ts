import { LoginDto, SignupDto } from "@/dtos/auth.dto";
import * as authService from "@/services/auth.service";
import type { AuthenticatedSession } from "@/services/auth.service";
import { sendControllerError } from "@/utils/controller-error";
import {
  clearRefreshTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@/utils/refresh-token-cookie";
import { Request, Response } from "express";

type EmptyParams = Record<string, never>;

const sendSession = (
  res: Response,
  status: number,
  session: AuthenticatedSession,
  message?: string,
): void => {
  const {
    refreshToken,
    refreshTokenExpiresInSeconds,
    ...publicSession
  } = session;

  setRefreshTokenCookie(res, refreshToken, refreshTokenExpiresInSeconds);
  res.setHeader("Cache-Control", "no-store");
  res
    .status(status)
    .json(message ? { message, ...publicSession } : publicSession);
};

// POST /api/v1/auth/signup
export const signup = async (
  req: Request<EmptyParams, unknown, SignupDto>,
  res: Response,
): Promise<void> => {
  try {
    const result = await authService.signup(req.body);

    if (result.status === "email_exists") {
      res.status(409).json({ message: "Email is already registered" });
      return;
    }

    sendSession(res, 201, result.session, "Account created");
  } catch (error: unknown) {
    sendControllerError(error, res, {
      badRequest: "Invalid signup data",
      internalServerError: "Failed to create account",
    });
  }
};

// POST /api/v1/auth/login
export const login = async (
  req: Request<EmptyParams, unknown, LoginDto>,
  res: Response,
): Promise<void> => {
  try {
    const result = await authService.login(
      req.body,
      getRefreshTokenCookie(req),
    );

    if (result.status === "invalid_credentials") {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    sendSession(res, 200, result.session, "Login successful");
  } catch (error: unknown) {
    sendControllerError(error, res, {
      internalServerError: "Failed to log in",
    });
  }
};

// POST /api/v1/auth/refresh
export const refresh = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await authService.refresh(getRefreshTokenCookie(req));

    if (result.status === "missing_token") {
      res.status(401).json({ message: "Refresh token is required" });
      return;
    }

    if (result.status === "invalid_token") {
      clearRefreshTokenCookie(res);
      res.status(401).json({ message: "Refresh token is invalid or expired" });
      return;
    }

    if (result.status === "user_missing") {
      clearRefreshTokenCookie(res);
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    sendSession(res, 200, result.session);
  } catch (error: unknown) {
    sendControllerError(error, res, {
      internalServerError: "Failed to refresh authentication",
    });
  }
};

// POST /api/v1/auth/logout
export const logout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await authService.logout(getRefreshTokenCookie(req));

    clearRefreshTokenCookie(res);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: unknown) {
    sendControllerError(error, res, {
      internalServerError: "Failed to log out",
    });
  }
};

// GET /api/v1/auth/me
export const getCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await authService.getCurrentUser(
      req.auth!.userId,
      req.auth!.sessionId,
    );

    if (result.status === "user_missing") {
      clearRefreshTokenCookie(res);
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    res.status(200).json({ user: result.user });
  } catch (error: unknown) {
    sendControllerError(error, res, {
      internalServerError: "Failed to retrieve current user",
    });
  }
};
