import { Router } from "express";
import * as controller from "@/controllers/todo.controller";
import { requireAuth } from "@/middlewares/auth.middleware";
import {
  validateCreateTodo,
  validateTodoId,
  validateUpdateTodo,
} from "@/middlewares/todo.middleware";

const router = Router();

router.use(requireAuth);

router.post("/", validateCreateTodo, controller.createTodo);
router.get("/", controller.getTodos);
router.get("/:id", validateTodoId, controller.getTodoById);
router.put("/:id", validateTodoId, validateUpdateTodo, controller.updateTodo);
router.delete("/:id", validateTodoId, controller.deleteTodo);
router.patch("/restore/:id", validateTodoId, controller.restoreTodo);
router.delete("/clear/:id", validateTodoId, controller.clearTodo);

export default router;
