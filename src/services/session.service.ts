import { redisClient } from "@/config/redis";
import { SESSION_TTL_SECONDS } from "@/config/session";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";

const sessionDataSchema = z.object({
  userId: z.string().min(1),
  createdAt: z.iso.datetime(),
});

export type SessionData = z.infer<typeof sessionDataSchema>;

const redisKeyPrefix = process.env.REDIS_KEY_PREFIX?.trim() || "achievable";

const hashSessionToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

const getSessionKey = (token: string): string => {
  return `${redisKeyPrefix}:session:${hashSessionToken(token)}`;
};

export const createSession = async (userId: string): Promise<string> => {
  const token = randomBytes(32).toString("base64url");
  const session: SessionData = {
    userId,
    createdAt: new Date().toISOString(),
  };

  await redisClient.set(getSessionKey(token), JSON.stringify(session), {
    expiration: {
      type: "EX",
      value: SESSION_TTL_SECONDS,
    }
  });

  return token;
};

export const getSession = async (
  token: string,
): Promise<SessionData | null> => {
  const key = getSessionKey(token);
  const serializedSession = await redisClient.get(key);

  if (!serializedSession) {
    return null;
  }

  try {
    const result = sessionDataSchema.safeParse(JSON.parse(serializedSession));

    if (result.success) {
      return result.data;
    }
  } catch {
    // Invalid internal session data is revoked below.
  }

  await redisClient.del(key);
  return null;
};

export const deleteSession = async (token: string): Promise<void> => {
  await redisClient.del(getSessionKey(token));
};
