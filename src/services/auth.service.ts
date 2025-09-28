import bcrypt from "bcrypt";
import User from "@/models/user.model";
import hash from "@/utils/hash";

// Sign up
type signupProps = {
  email: string;
  username: string;
  password: string;
};

export async function signup({ email, username, password }: signupProps) {
  const hashPassword = await hash(password);

  const user = new User({
    email: email,
    username: username,
    password: hashPassword,
  });

  await user.save();

  return { id: user.id, email: user.email };
}

// Login
type loginProps = {
  email: string;
  password: string;
};

export async function login({ email, password }: loginProps) {
  const existingUser = await User.findOne({ email: email });

  if (!existingUser || !existingUser.password) {
    // We actually ensure every user got password
    return null;
  }

  const matchPassword = await bcrypt.compare(password, existingUser.password);
  if (!matchPassword) {
    return null;
  }

  return { id: existingUser.id, username: existingUser.username };
}
