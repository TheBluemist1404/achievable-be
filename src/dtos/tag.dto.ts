import { z } from "zod";

export const tagNameSchema = z
  .string()
  .trim()
  .min(1, "Tag name is required")
  .max(30, "Tag name must not exceed 30 characters")
  .transform((tag) => tag.toLowerCase());

export const tagListSchema = z
  .array(tagNameSchema)
  .max(20, "A todo can have at most 20 tags")
  .transform((tags) => [...new Set(tags)]);

export const createTagSchema = z
  .object({
    name: tagNameSchema,
  })
  .strict();

export type CreateTagDto = z.infer<typeof createTagSchema>;
