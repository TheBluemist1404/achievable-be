
import { Router } from "express";
import * as controller from '@/controllers/auth.controller';
import * as validate from '@/middlewares/validate.middleware';

const router = Router()

router.post('/signup',validate.validateSignup, controller.signup);
router.post('/login',validate.validateLogin, controller.login);

module.exports = router;