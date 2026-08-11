import { CreateTodoDto, UpdateTodoDto } from "@/dtos/todo.dto";
import Tag from "@/models/tag.model";
import Todo from "@/models/todo.model";
import { toSlug } from "@/utils/to-slug";
import mongoose from "mongoose";

const ensureOwnedTags = async (
  ownerId: string,
  tagIds: string[],
): Promise<void> => {
  if (tagIds.length === 0) return;

  const ownedTagCount = await Tag.countDocuments({
    _id: { $in: tagIds },
    ownerId,
  });

  if (ownedTagCount !== tagIds.length) {
    throw new mongoose.Error.ValidationError(undefined);
  }
};

export const createTodo = async (ownerId: string, input: CreateTodoDto) => {
  const { title, description, tags, remindOptions, dueDate } = input;

  await ensureOwnedTags(ownerId, tags);

  const todo = await Todo.create({
    ownerId,
    title,
    description,
    tags,
    remindOptions,
    dueDate,
    slug: toSlug(title, description),
  });

  return todo.populate("tags");
};

export const getTodos = async (ownerId: string) => {
  return Todo.find({ ownerId }).populate("tags");
};

export const getTodoById = async (ownerId: string, todoId: string) => {
  return Todo.findOne({
    _id: todoId,
    ownerId,
  }).populate("tags");
};

export const updateTodo = async (
  ownerId: string,
  todoId: string,
  input: UpdateTodoDto,
) => {
  if (input.tags !== undefined) {
    await ensureOwnedTags(ownerId, input.tags);
  }

  const todo = await Todo.findOne({
    _id: todoId,
    ownerId,
  });

  if (!todo) {
    return null;
  }

  const updates: UpdateTodoDto & { slug?: string } = { ...input };

  if (input.title !== undefined || input.description !== undefined) {
    updates.slug = toSlug(
      input.title ?? todo.title,
      input.description ?? todo.description ?? undefined,
    );
  }

  todo.set(updates);
  const updatedTodo = await todo.save();
  return updatedTodo.populate("tags");
};

// Implement soft delete
export const deleteTodo = async (ownerId: string, todoId: string): Promise<boolean> => {
  const todo = await Todo.findOneAndUpdate(
    { _id: todoId, ownerId },
    { deletedAt: new Date() },
  );

  return todo !== null;
}

export const restoreTodo = async (ownerId: string, todoId: string): Promise<boolean> => {
  const todo = await Todo.findOneAndUpdate(
    { _id: todoId, ownerId },
    { deletedAt: null },
  );

  return todo !== null;
};

export const clearTodo = async (
  ownerId: string,
  todoId: string,
): Promise<boolean> => {
  const todo = await Todo.findOneAndDelete({
    _id: todoId,
    ownerId,
  });

  return todo !== null;
};
