import { createTagSchema } from "@/dtos/tag.dto";
import { validateBody } from "@/middlewares/validate.middleware";

export const validateCreateTag = validateBody(createTagSchema);
