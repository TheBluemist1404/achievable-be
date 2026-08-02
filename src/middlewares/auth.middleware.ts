import { loginSchema, signupSchema } from "@/dtos/auth.dto";
import { getSession } from "@/services/session.service";
import { validateBody } from "@/middlewares/validate.middleware";
import {
  clearSessionCookie,
  getSessionCookie,
} from "@/utils/session-cookie";
import { Request, Response, NextFunction } from "express";

export const validateSignup = validateBody(signupSchema);
export const validateLogin = validateBody(loginSchema);

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sessionToken = getSessionCookie(req);

    if (!sessionToken) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const session = await getSession(sessionToken);

    if (!session) {
      clearSessionCookie(res);
      res.status(401).json({ message: "Session is invalid or expired" });
      return;
    }

    req.auth = {
      userId: session.userId,
      sessionToken,
    };

    next();
  } catch (error: unknown) {
    next(error);
  }
};
