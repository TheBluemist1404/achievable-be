import { loginSchema, signupSchema } from "@/dtos/auth.dto";
import { validateBody } from "@/middlewares/validate.middleware";
import { verifyAccessToken } from "@/services/access-token.service";
import { Request, Response, NextFunction } from "express";

export const validateSignup = validateBody(signupSchema);
export const validateLogin = validateBody(loginSchema);

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authorization = req.header("authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);

  if (!match) {
    res.status(401).json({ message: "Access token is required" });
    return;
  }

  const payload = verifyAccessToken(match[1]);

  if (!payload) {
    res.status(401).json({ message: "Access token is invalid or expired" });
    return;
  }

  req.auth = {
    userId: payload.userId,
    sessionId: payload.sessionId,
  };

  next();
};
