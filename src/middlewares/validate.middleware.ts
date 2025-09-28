import { Request, Response, NextFunction } from "express";
import User from "@/models/user.model";

export const validateSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {email, username, password} = req.body

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Missing info!" });
    }

    if (password.length <6) {
      return res.status(400).json({ message: "Password length must be >= 6 characters" });
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists!" });
    }

    return next();
  } catch (error) {
    console.log(error)
    next(error); // let error middleware handle DB errors
  }
};


export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(409).json({message: "Missing info!"})
    }

    return next();
  } catch (error) {
    console.log(error)
    next(error)
  }
}