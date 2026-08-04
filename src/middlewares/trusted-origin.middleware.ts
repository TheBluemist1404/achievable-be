import { isTrustedClientOrigin } from "@/config/cors";
import { NextFunction, Request, Response } from "express";

export const requireTrustedOrigin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const origin = req.get("origin");

  if (!isTrustedClientOrigin(origin)) {
    res.status(403).json({ message: "Origin is not allowed" });
    return;
  }

  next();
};
