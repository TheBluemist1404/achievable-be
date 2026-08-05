import { Router } from "express";
import * as controller from "@/controllers/tag.controller";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validateCreateTag } from "@/middlewares/tag.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", controller.getTags);
router.post("/", validateCreateTag, controller.createTag);

export default router;
