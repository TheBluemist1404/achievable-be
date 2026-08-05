import { CreateTodoDto, UpdateTodoDto } from "@/dtos/todo.dto";
import Todo from "@/models/todo.model";
import { toSlug } from "@/utils/to-slug";

export const createTodo = async (
  ownerId: string,
  input: CreateTodoDto,
) => {
  const { title, description, tags, remindOptions, dueDate } = input;

  return Todo.create({
    ownerId,
    title,
    description,
    tags,
    remindOptions,
    dueDate,
    slug: toSlug(title, description),
  });
};

export const getTodos = async (ownerId: string) => {
  return Todo.find({ ownerId });
};

export const getTodoById = async (ownerId: string, todoId: string) => {
  return Todo.findOne({
    _id: todoId,
    ownerId,
  });
};

export const updateTodo = async (
  ownerId: string,
  todoId: string,
  input: UpdateTodoDto,
) => {
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
  return todo.save();
};

export const deleteTodo = async (
  ownerId: string,
  todoId: string,
): Promise<boolean> => {
  const todo = await Todo.findOneAndDelete({
    _id: todoId,
    ownerId,
  });

  return todo !== null;
};
