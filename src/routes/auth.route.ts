
import { Router } from "express";
import * as controller from "@/controllers/auth.controller";
import {
  requireAuth,
  validateLogin,
  validateSignup,
} from "@/middlewares/auth.middleware";

const router = Router();

router.post("/signup", validateSignup, controller.signup);
router.post("/login", validateLogin, controller.login);
router.post("/logout", controller.logout);
router.get("/me", requireAuth, controller.getCurrentUser);

export default router;
