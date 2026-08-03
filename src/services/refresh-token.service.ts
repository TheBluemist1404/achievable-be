import { redisClient } from "@/config/redis";
import { REFRESH_TOKEN_TTL_SECONDS } from "@/config/token";
import { createHash, randomBytes, randomUUID } from "crypto";
import { z } from "zod";

const redisKeyPrefix = process.env.REDIS_KEY_PREFIX?.trim() || "achievable";

const refreshRecordSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().min(1),
});

const refreshSessionSchema = refreshRecordSchema.extend({
  currentRefreshTokenHash: z.string().length(64),
  issuedAt: z.iso.datetime(),
});

type RefreshRecord = z.infer<typeof refreshRecordSchema>;
type RefreshSession = z.infer<typeof refreshSessionSchema>;

export interface RefreshTokenPair {
  refreshToken: string;
  sessionId: string;
  userId: string;
  expiresInSeconds: number;
}

export type RefreshRotationResult =
  | ({ status: "rotated" } & RefreshTokenPair)
  | { status: "invalid" | "reused" };

const ROTATE_REFRESH_TOKEN_SCRIPT = `
local activeRecord = redis.call("GET", KEYS[2])

if not activeRecord then
  if redis.call("EXISTS", KEYS[3]) == 1 then
    return {-2, 0}
  end
  return {-1, 0}
end

local session = redis.call("GET", KEYS[1])
if not session then
  redis.call("DEL", KEYS[2])
  return {-1, 0}
end

local sessionData = cjson.decode(session)
if sessionData.currentRefreshTokenHash ~= ARGV[1] then
  return {-2, 0}
end

local ttl = redis.call("TTL", KEYS[1])
if ttl <= 0 then
  redis.call("DEL", KEYS[1], KEYS[2])
  return {-1, 0}
end

redis.call("DEL", KEYS[2])
redis.call("SET", KEYS[3], ARGV[2], "EX", ttl)
redis.call("SET", KEYS[4], ARGV[3], "EX", ttl)
redis.call("SET", KEYS[1], ARGV[4], "EX", ttl)

return {1, ttl}
`;

const hashRefreshToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

const createRefreshToken = (): string => {
  return randomBytes(48).toString("base64url");
};

const parseJson = (value: string): unknown | null => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getSessionKey = (sessionId: string): string => {
  return `${redisKeyPrefix}:auth-session:${sessionId}`;
};

const getActiveRefreshKey = (tokenHash: string): string => {
  return `${redisKeyPrefix}:refresh:active:${tokenHash}`;
};

const getUsedRefreshKey = (tokenHash: string): string => {
  return `${redisKeyPrefix}:refresh:used:${tokenHash}`;
};

export const createRefreshSession = async (
  userId: string,
): Promise<RefreshTokenPair> => {
  const sessionId = randomUUID();
  const refreshToken = createRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const record: RefreshRecord = { sessionId, userId };
  const session: RefreshSession = {
    ...record,
    currentRefreshTokenHash: refreshTokenHash,
    issuedAt: new Date().toISOString(),
  };

  await redisClient
    .multi()
    .set(getSessionKey(sessionId), JSON.stringify(session), {
      expiration: { type: "EX", value: REFRESH_TOKEN_TTL_SECONDS },
    })
    .set(getActiveRefreshKey(refreshTokenHash), JSON.stringify(record), {
      expiration: { type: "EX", value: REFRESH_TOKEN_TTL_SECONDS },
    })
    .exec();

  return {
    refreshToken,
    sessionId,
    userId,
    expiresInSeconds: REFRESH_TOKEN_TTL_SECONDS,
  };
};

export const rotateRefreshToken = async (
  refreshToken: string,
): Promise<RefreshRotationResult> => {
  const currentHash = hashRefreshToken(refreshToken);
  const activeKey = getActiveRefreshKey(currentHash);
  const usedKey = getUsedRefreshKey(currentHash);
  const serializedRecord = await redisClient.get(activeKey);

  if (!serializedRecord) {
    const reusedSessionId = await redisClient.get(usedKey);

    if (reusedSessionId) {
      await revokeRefreshSession(reusedSessionId);
      return { status: "reused" };
    }

    return { status: "invalid" };
  }

  const recordResult = refreshRecordSchema.safeParse(
    parseJson(serializedRecord),
  );

  if (!recordResult.success) {
    await redisClient.del(activeKey);
    return { status: "invalid" };
  }

  const record = recordResult.data;
  const newRefreshToken = createRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
  const newSession: RefreshSession = {
    ...record,
    currentRefreshTokenHash: newRefreshTokenHash,
    issuedAt: new Date().toISOString(),
  };

  const result = await redisClient.eval(ROTATE_REFRESH_TOKEN_SCRIPT, {
    keys: [
      getSessionKey(record.sessionId),
      activeKey,
      usedKey,
      getActiveRefreshKey(newRefreshTokenHash),
    ],
    arguments: [
      currentHash,
      record.sessionId,
      JSON.stringify(record),
      JSON.stringify(newSession),
    ],
  });

  const [status, expiresInSeconds] = result as [number, number];

  if (status === -2) {
    await revokeRefreshSession(record.sessionId);
    return { status: "reused" };
  }

  if (status !== 1 || expiresInSeconds <= 0) {
    return { status: "invalid" };
  }

  return {
    status: "rotated",
    refreshToken: newRefreshToken,
    sessionId: record.sessionId,
    userId: record.userId,
    expiresInSeconds,
  };
};

export const revokeRefreshToken = async (
  refreshToken: string,
): Promise<void> => {
  const tokenHash = hashRefreshToken(refreshToken);
  const activeRecord = await redisClient.get(getActiveRefreshKey(tokenHash));

  if (activeRecord) {
    const result = refreshRecordSchema.safeParse(parseJson(activeRecord));

    if (result.success) {
      await revokeRefreshSession(result.data.sessionId);
      return;
    }

    await redisClient.del(getActiveRefreshKey(tokenHash));
  }

  const usedSessionId = await redisClient.get(getUsedRefreshKey(tokenHash));
  if (usedSessionId) {
    await revokeRefreshSession(usedSessionId);
  }
};

export const revokeRefreshSession = async (
  sessionId: string,
): Promise<void> => {
  const sessionKey = getSessionKey(sessionId);
  const serializedSession = await redisClient.get(sessionKey);
  const sessionResult = refreshSessionSchema.safeParse(
    serializedSession ? parseJson(serializedSession) : null,
  );

  if (!sessionResult.success) {
    await redisClient.del(sessionKey);
    return;
  }

  await redisClient
    .multi()
    .del(sessionKey)
    .del(getActiveRefreshKey(sessionResult.data.currentRefreshTokenHash))
    .exec();
};
