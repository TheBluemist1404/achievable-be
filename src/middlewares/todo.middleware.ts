import {
  createTodoSchema,
  TodoParams,
  updateTodoSchema,
} from "@/dtos/todo.dto";
import { validateBody } from "@/middlewares/validate.middleware";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const validateCreateTodo = validateBody(createTodoSchema);
export const validateUpdateTodo = validateBody(updateTodoSchema);

export const validateTodoId = (
  req: Request<TodoParams>,
  res: Response,
  next: NextFunction,
): void => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid todo id" });
    return;
  }

  next();
};
