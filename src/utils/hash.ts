import bcrypt from 'bcrypt';

export default function hash(password: string) {
  const saltRounds = parseInt(process.env.SALT_ROUNDS ?? "10", 10);
  return bcrypt.hash(password, saltRounds);
}