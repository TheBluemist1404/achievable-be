
import { Router } from "express";
import * as controller from "@/controllers/auth.controller";
import {
  requireAuth,
  validateLogin,
  validateSignup,
} from "@/middlewares/auth.middleware";
import { requireTrustedOrigin } from "@/middlewares/trusted-origin.middleware";

const router = Router();

router.use(requireTrustedOrigin);

router.post("/signup", validateSignup, controller.signup);
router.post("/login", validateLogin, controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.get("/me", requireAuth, controller.getCurrentUser);

export default router;
