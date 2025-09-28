import { Request, Response } from "express";
import * as authService from '@/services/auth.service'
import { generateToken } from "@/utils/jwtGenerate";

export const signup = async (req: Request, res: Response) => {
  try {
    const {email, username, password} = req.body;
    const result = await authService.signup({email, username, password})
    return res.status(200).json({message: result})
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: error.message})
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // authService.login should return a DTO (or null) — no HTTP details here
    const result = await authService.login({ email, password });

    if (!result) {
      // Generic failure to avoid user enumeration
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const tokens = generateToken({id : result.id as string, username: result.username as string})

    return res.status(200).json({ message: "Login successful", tokens: tokens });
  } catch (error) {
    return res.status(500).json({message: error.message})
  }
};
