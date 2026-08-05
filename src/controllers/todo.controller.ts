import { CreateTodoDto, TodoParams, UpdateTodoDto } from "@/dtos/todo.dto";
import * as todoService from "@/services/todo.service";
import { sendControllerError } from "@/utils/controller-error";
import { Request, Response } from "express";

type EmptyParams = Record<string, never>;

// POST /api/v1/todo
export const createTodo = async (
  req: Request<EmptyParams, unknown, CreateTodoDto>,
  res: Response,
): Promise<void> => {
  try {
    const todo = await todoService.createTodo(req.auth!.userId, req.body);

    res.status(201).json({ message: "New todo created", todo });
  } catch (error: unknown) {
    sendControllerError(error, res, {
      badRequest: "Invalid todo data",
      internalServerError: "Failed to create todo",
    });
  }
};

// GET /api/v1/todo
export const getTodos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const todos = await todoService.getTodos(req.auth!.userId);
    res.status(200).json({ todos });
  } catch (error: unknown) {
    sendControllerError(error, res, {
      internalServerError: "Failed to retrieve todos",
    });
  }
};

// GET /api/v1/todo/:id
export const getTodoById = async (
  req: Request<TodoParams>,
  res: Response
): Promise<void> => {
  try {
    const todo = await todoService.getTodoById(
      req.auth!.userId,
      req.params.id,
    );

    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }

    res.status(200).json({ todo });
  } catch (error: unknown) {
    sendControllerError(error, res, {
      internalServerError: "Failed to retrieve todo",
    });
  }
};

// PUT /api/v1/todo/:id
export const updateTodo = async (
  req: Request<TodoParams, unknown, UpdateTodoDto>,
  res: Response
): Promise<void> => {
  try {
    const updatedTodo = await todoService.updateTodo(
      req.auth!.userId,
      req.params.id,
      req.body,
    );

    if (!updatedTodo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }

    res.status(200).json({ todo: updatedTodo });
  } catch (error: unknown) {
    sendControllerError(error, res, {
      badRequest: "Invalid todo data",
      internalServerError: "Failed to update todo",
    });
  }
};

// DELETE /api/v1/todo/:id
export const deleteTodo = async (
  req: Request<TodoParams>,
  res: Response
): Promise<void> => {
  try {
    const wasDeleted = await todoService.deleteTodo(
      req.auth!.userId,
      req.params.id,
    );

    if (!wasDeleted) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }

    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error: unknown) {
    sendControllerError(error, res, {
      internalServerError: "Failed to delete todo",
    });
  }
};
