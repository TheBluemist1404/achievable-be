import bcrypt from "bcrypt";
import { LoginDto, SignupDto } from "@/dtos/auth.dto";
import User from "@/models/user.model";
import {
  issueAccessToken,
  issueTokenPair,
} from "@/services/auth-token.service";
import {
  revokeRefreshSession,
  revokeRefreshToken,
  rotateRefreshToken,
} from "@/services/refresh-token.service";
import hash from "@/utils/hash";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthenticatedSession {
  user: AuthUser;
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
}

export type SignupResult =
  | { status: "created"; session: AuthenticatedSession }
  | { status: "email_exists" };

export type LoginResult =
  | { status: "authenticated"; session: AuthenticatedSession }
  | { status: "invalid_credentials" };

export type RefreshResult =
  | { status: "refreshed"; session: AuthenticatedSession }
  | { status: "missing_token" }
  | { status: "invalid_token" }
  | { status: "user_missing" };

export type CurrentUserResult =
  | { status: "found"; user: AuthUser }
  | { status: "user_missing" };

const toAuthUser = (user: {
  _id: { toString(): string };
  email: string;
  username: string;
}): AuthUser => ({
  id: user._id.toString(),
  email: user.email,
  username: user.username,
});

const isDuplicateKeyError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
};

const getUserById = async (userId: string): Promise<AuthUser | null> => {
  const user = await User.findById(userId);
  return user ? toAuthUser(user) : null;
};

const issueSession = async (user: AuthUser): Promise<AuthenticatedSession> => {
  const tokens = await issueTokenPair(user.id);

  return {
    user,
    accessToken: tokens.accessToken,
    accessTokenExpiresInSeconds: tokens.accessTokenExpiresInSeconds,
    refreshToken: tokens.refreshSession.refreshToken,
    refreshTokenExpiresInSeconds: tokens.refreshSession.expiresInSeconds,
  };
};

export const signup = async ({
  email,
  username,
  password,
}: SignupDto): Promise<SignupResult> => {
  const existingUser = await User.exists({ email });

  if (existingUser) {
    return { status: "email_exists" };
  }

  const hashPassword = await hash(password);

  try {
    const user = await User.create({
      email,
      username,
      password: hashPassword,
    });
    const session = await issueSession(toAuthUser(user));

    return { status: "created", session };
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      return { status: "email_exists" };
    }

    throw error;
  }
};

export const login = async (
  { email, password }: LoginDto,
  previousRefreshToken: string | null,
): Promise<LoginResult> => {
  const existingUser = await User.findOne({ email }).select("+password");

  if (!existingUser || !existingUser.password) {
    return { status: "invalid_credentials" };
  }

  const passwordMatches = await bcrypt.compare(
    password,
    existingUser.password,
  );

  if (!passwordMatches) {
    return { status: "invalid_credentials" };
  }

  if (previousRefreshToken) {
    await revokeRefreshToken(previousRefreshToken);
  }

  const session = await issueSession(toAuthUser(existingUser));
  return { status: "authenticated", session };
};

export const refresh = async (
  currentRefreshToken: string | null,
): Promise<RefreshResult> => {
  if (!currentRefreshToken) {
    return { status: "missing_token" };
  }

  const rotation = await rotateRefreshToken(currentRefreshToken);

  if (rotation.status !== "rotated") {
    return { status: "invalid_token" };
  }

  const user = await getUserById(rotation.userId);

  if (!user) {
    await revokeRefreshSession(rotation.sessionId);
    return { status: "user_missing" };
  }

  const access = issueAccessToken({
    userId: rotation.userId,
    sessionId: rotation.sessionId,
  });

  return {
    status: "refreshed",
    session: {
      user,
      ...access,
      refreshToken: rotation.refreshToken,
      refreshTokenExpiresInSeconds: rotation.expiresInSeconds,
    },
  };
};

export const logout = async (
  refreshToken: string | null,
): Promise<void> => {
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
};

export const getCurrentUser = async (
  userId: string,
  sessionId: string,
): Promise<CurrentUserResult> => {
  const user = await getUserById(userId);

  if (!user) {
    await revokeRefreshSession(sessionId);
    return { status: "user_missing" };
  }

  return { status: "found", user };
};
