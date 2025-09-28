import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

type payload = {
  id: string,
  username: string
}

export function generateToken(user: payload) {
  const payload: payload = {
    id: user.id,
    username: user.username
  }

  const accessToken =  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET || "secret")
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRETE || "secret")

  return {accessToken, refreshToken}
}