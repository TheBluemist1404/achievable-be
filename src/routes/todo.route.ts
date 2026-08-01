import { Router } from "express"
import * as controller from '@/controllers/todo.controller'
import {
  validateCreateTodo,
  validateTodoId,
  validateUpdateTodo,
} from "@/middlewares/todo.middleware"

const router = Router()

router.post('/', validateCreateTodo, controller.createTodo)
router.get('/', controller.getTodos)
router.get('/:id', validateTodoId, controller.getTodoById)
router.put('/:id', validateTodoId, validateUpdateTodo, controller.updateTodo)
router.delete('/:id', validateTodoId, controller.deleteTodo)

export default router;
