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
  } catch (err) {
    next(err); // let error middleware handle DB errors
  }
};


export const validateLogin = (_req: Request, _res: Response, next: NextFunction) => {
  // res.status(200).json({message: "validateLogin route"});
  next()
}