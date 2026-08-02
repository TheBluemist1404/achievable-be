import bcrypt from "bcrypt";
import { LoginDto, SignupDto } from "@/dtos/auth.dto";
import User from "@/models/user.model";
import hash from "@/utils/hash";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

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

export async function signup({
  email,
  username,
  password,
}: SignupDto): Promise<AuthUser | null> {
  const existingUser = await User.exists({ email });

  if (existingUser) {
    return null;
  }

  const hashPassword = await hash(password);

  try {
    const user = await User.create({
      email,
      username,
      password: hashPassword,
    });

    return toAuthUser(user);
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      return null;
    }

    throw error;
  }
}

export async function login({
  email,
  password,
}: LoginDto): Promise<AuthUser | null> {
  const existingUser = await User.findOne({ email }).select("+password");

  if (!existingUser || !existingUser.password) {
    return null;
  }

  const matchPassword = await bcrypt.compare(password, existingUser.password);

  if (!matchPassword) {
    return null;
  }

  return toAuthUser(existingUser);
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const user = await User.findById(userId);
  return user ? toAuthUser(user) : null;
}
