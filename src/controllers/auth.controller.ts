import { LoginDto, SignupDto } from "@/dtos/auth.dto";
import { Request, Response } from "express";
import * as authService from "@/services/auth.service";
import {
  createSession,
  deleteSession,
} from "@/services/session.service";
import { sendControllerError } from "@/utils/controller-error";
import {
  clearSessionCookie,
  getSessionCookie,
  setSessionCookie,
} from "@/utils/session-cookie";

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

    const sessionToken = await createSession(user.id);
    setSessionCookie(res, sessionToken);

    res.status(201).json({ message: "Account created", user });
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

    const previousSessionToken = getSessionCookie(req);

    if (previousSessionToken) {
      await deleteSession(previousSessionToken);
    }

    const sessionToken = await createSession(user.id);
    setSessionCookie(res, sessionToken);

    res.status(200).json({ message: "Login successful", user });
  } catch (error: unknown) {
    sendControllerError(error, res, {
      internalServerError: "Failed to log in",
    });
  }
};

// POST /api/v1/auth/logout
export const logout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const sessionToken = getSessionCookie(req);

    if (sessionToken) {
      await deleteSession(sessionToken);
    }

    clearSessionCookie(res);
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
      await deleteSession(req.auth!.sessionToken);
      clearSessionCookie(res);
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
