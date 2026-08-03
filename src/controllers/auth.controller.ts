import { LoginDto, SignupDto } from "@/dtos/auth.dto";
import { Request, Response } from "express";
import * as authService from "@/services/auth.service";
import {
  issueAccessToken,
  issueTokenPair,
} from "@/services/auth-token.service";
import {
  createRefreshSession,
  revokeRefreshSession,
  revokeRefreshToken,
  rotateRefreshToken,
} from "@/services/refresh-token.service";
import { sendControllerError } from "@/utils/controller-error";
import {
  clearRefreshTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@/utils/refresh-token-cookie";

type EmptyParams = Record<string, never>;

// POST /api/v1/auth/signup
export const signup = async (
  req: Request<EmptyParams, unknown, SignupDto>,
  res: Response,
): Promise<void> => {
  try {
    const user = await authService.signup(req.body);

    if (!user) {
      res.status(409).json({ message: "Email is already registered" });
      return;
    }

    const tokens = await issueTokenPair(user.id);
    setRefreshTokenCookie(
      res,
      tokens.refreshSession.refreshToken,
      tokens.refreshSession.expiresInSeconds,
    );

    res.setHeader("Cache-Control", "no-store");
    res.status(201).json({
      message: "Account created",
      user,
      accessToken: tokens.accessToken,
      accessTokenExpiresInSeconds: tokens.accessTokenExpiresInSeconds,
    });
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
    const user = await authService.login(req.body);

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const previousRefreshToken = getRefreshTokenCookie(req);

    if (previousRefreshToken) {
      await revokeRefreshToken(previousRefreshToken);
    }

    const tokens = await issueTokenPair(user.id);
    setRefreshTokenCookie(
      res,
      tokens.refreshSession.refreshToken,
      tokens.refreshSession.expiresInSeconds,
    );

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      message: "Login successful",
      user,
      accessToken: tokens.accessToken,
      accessTokenExpiresInSeconds: tokens.accessTokenExpiresInSeconds,
    });
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
    const currentRefreshToken = getRefreshTokenCookie(req);

    if (!currentRefreshToken) {
      res.status(401).json({ message: "Refresh token is required" });
      return;
    }

    const rotation = await rotateRefreshToken(currentRefreshToken);

    if (rotation.status !== "rotated") {
      clearRefreshTokenCookie(res);
      res.status(401).json({ message: "Refresh token is invalid or expired" });
      return;
    }

    const user = await authService.getUserById(rotation.userId);

    if (!user) {
      await revokeRefreshSession(rotation.sessionId);
      clearRefreshTokenCookie(res);
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    const access = issueAccessToken({
      userId: rotation.userId,
      sessionId: rotation.sessionId,
    });

    setRefreshTokenCookie(
      res,
      rotation.refreshToken,
      rotation.expiresInSeconds,
    );

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      ...access,
      user,
    });
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
    const refreshToken = getRefreshTokenCookie(req);

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

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
    const user = await authService.getUserById(req.auth!.userId);

    if (!user) {
      await revokeRefreshSession(req.auth!.sessionId);
      clearRefreshTokenCookie(res);
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    res.status(200).json({ user });
  } catch (error: unknown) {
    sendControllerError(error, res, {
      internalServerError: "Failed to retrieve current user",
    });
  }
};
