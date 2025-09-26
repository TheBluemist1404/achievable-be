import { Request, Response, NextFunction } from "express";

module.exports.validateRegister = (_req: Request, _res: Response, next: NextFunction) => {
  // res.status(200).json({message: "validateRegister route"});
  next();
}

module.exports.validateLogin = (_req: Request, _res: Response, next: NextFunction) => {
  // res.status(200).json({message: "validateLogin route"});
  next()
}