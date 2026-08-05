import type { ParamsDictionary } from "express-serve-static-core";
import { z } from "zod";
import { tagListSchema } from "@/dtos/tag.dto";

export const REMIND_OPTIONS = ["2 days", "1 day", "1 hour"] as const;

export type RemindOption = (typeof REMIND_OPTIONS)[number];

const todoFields = {
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  tags: tagListSchema.default([]),
  remindOptions: z
    .array(z.enum(REMIND_OPTIONS))
    .min(1, "Select at least one reminder option"),
  dueDate: z.iso.datetime({ offset: true }),
};

export const createTodoSchema = z.object(todoFields).strict();

export const updateTodoSchema = z
  .object({
    ...todoFields,
    dueDate: todoFields.dueDate.nullable(),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export type CreateTodoDto = z.infer<typeof createTodoSchema>;
export type UpdateTodoDto = z.infer<typeof updateTodoSchema>;

export interface TodoParams extends ParamsDictionary {
  id: string;
}
