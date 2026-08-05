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
  const updates: UpdateTodoDto & { slug?: string } = { ...input };

  if (input.title !== undefined) {
    updates.slug = toSlug(input.title, input.description);
  }

  return Todo.findOneAndUpdate(
    { _id: todoId, ownerId },
    { $set: updates },
    { new: true, runValidators: true },
  );
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
