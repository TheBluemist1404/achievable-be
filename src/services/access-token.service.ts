import {
  ACCESS_TOKEN_AUDIENCE,
  ACCESS_TOKEN_ISSUER,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_TTL_SECONDS,
} from "@/config/token";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload {
  userId: string;
  sessionId: string;
}

export const createAccessToken = ({
  userId,
  sessionId,
}: AccessTokenPayload): string => {
  return jwt.sign(
    { sid: sessionId },
    ACCESS_TOKEN_SECRET,
    {
      algorithm: "HS256",
      audience: ACCESS_TOKEN_AUDIENCE,
      issuer: ACCESS_TOKEN_ISSUER,
      subject: userId,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    },
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      algorithms: ["HS256"],
      audience: ACCESS_TOKEN_AUDIENCE,
      issuer: ACCESS_TOKEN_ISSUER,
    });

    if (
      typeof payload === "string" ||
      !isValidAccessTokenPayload(payload)
    ) {
      return null;
    }

    return {
      userId: payload.sub,
      sessionId: payload.sid,
    };
  } catch {
    return null;
  }
};

const isValidAccessTokenPayload = (
  payload: JwtPayload,
): payload is JwtPayload & { sub: string; sid: string } => {
  return typeof payload.sub === "string" && typeof payload.sid === "string";
};
