import "dotenv/config";
import { CorsOptions } from "cors";

const developmentClientOrigin = "http://localhost:5173";
const configuredClientOrigins = process.env.CLIENT_URL?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (
  process.env.NODE_ENV === "production" &&
  (!configuredClientOrigins || configuredClientOrigins.length === 0)
) {
  throw new Error("CLIENT_URL is not configured");
}

export const trustedClientOrigins = new Set(
  configuredClientOrigins?.length
    ? configuredClientOrigins
    : [developmentClientOrigin],
);

export const isTrustedClientOrigin = (origin?: string): boolean => {
  return !origin || trustedClientOrigins.has(origin);
};

export const corsOptions: CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    callback(null, isTrustedClientOrigin(origin));
  },
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 24 * 60 * 60,
};
