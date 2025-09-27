import { Request, Response } from "express";
import * as authService from '@/services/auth.service'

export const signup = async (req: Request, res: Response) => {
  try {
    const {email, username, password} = req.body;
    const result = await authService.signup({email, username, password})
    res.status(200).json({message: result})
  } catch (error) {
    console.log(error)
    res.status(500).json({message: error.message})
  }
}

export const login = (_req: Request, res: Response) => {
  try {
    res.status(200).json({message: "Login route"})
  } catch (error) {
    console.log(error)
    res.status(500).json({message: error.message})
  }
}
