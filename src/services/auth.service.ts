import User from "@/models/user.model";
import hash from "@/utils/hash";

type signupProps = {
  email: string,
  username: string,
  password: string
}

export async function signup({email, username, password}: signupProps) {
  const hashPassword = await hash(password);

  const user = new User({
    email: email,
    username: username,
    password: hashPassword,
  });

  await user.save();

  return { id: user._id, email: user.email };
}
