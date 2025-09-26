import { Request, Response } from "express";

module.exports.register = (_req: Request, res: Response) => {
  res.status(200).json({message: "Registser route"})
}

module.exports.login = (_req: Request, res: Response) => {
  res.status(200).json({message: "Login route"})
}
