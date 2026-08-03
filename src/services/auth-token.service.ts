import { ACCESS_TOKEN_TTL_SECONDS } from "@/config/token";
import {
  AccessTokenPayload,
  createAccessToken,
} from "@/services/access-token.service";
import { createRefreshSession } from "@/services/refresh-token.service";

export const issueAccessToken = (payload: AccessTokenPayload) => {
  return {
    accessToken: createAccessToken(payload),
    accessTokenExpiresInSeconds: ACCESS_TOKEN_TTL_SECONDS,
  };
};

export const issueTokenPair = async (userId: string) => {
  const refreshSession = await createRefreshSession(userId);

  return {
    ...issueAccessToken({ userId, sessionId: refreshSession.sessionId }),
    refreshSession,
  };
};
