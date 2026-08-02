import { CreateTodoDto, TodoParams, UpdateTodoDto } from "@/dtos/todo.dto";
import Todo from "@/models/todo.model";
import { sendControllerError } from "@/utils/controller-error";
import { toSlug } from "@/utils/to-slug";
import { Request, Response } from "express";

type EmptyParams = Record<string, never>;

// POST /api/v1/todo
export const createTodo = async (
  req: Request<EmptyParams, unknown, CreateTodoDto>,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, remindOptions, dueDate } = req.body;
    const slug = toSlug(title, description);

    const todo = await Todo.create({
      ownerId: req.auth!.userId,
      title,
      description,
      remindOptions,
      dueDate,
      slug,
    });

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
    const todos = await Todo.find({ ownerId: req.auth!.userId });
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
    const { id } = req.params;

    const todo = await Todo.findOne({
      _id: id,
      ownerId: req.auth!.userId,
    });

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
    const { id } = req.params;
    const { title, description, remindOptions, dueDate } = req.body;

    const updates: UpdateTodoDto & { slug?: string } = {};

    if (title !== undefined) {
      updates.title = title;
      updates.slug = toSlug(title, description);
    }
    if (description !== undefined) {
      updates.description = description;
    }
    if (remindOptions !== undefined) {
      updates.remindOptions = remindOptions;
    }
    if (dueDate !== undefined) {
      updates.dueDate = dueDate;
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, ownerId: req.auth!.userId },
      { $set: updates },
      { new: true, runValidators: true }
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
    const { id } = req.params;

    const deletedTodo = await Todo.findOneAndDelete({
      _id: id,
      ownerId: req.auth!.userId,
    });

    if (!deletedTodo) {
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
