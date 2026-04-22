import { Router, type Router as RouterType } from "express";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "@dobrokot/shared";
import * as ctrl from "../controllers/auth.controller";

export const authRouter: RouterType = Router();

authRouter.post("/register", validate(registerSchema), ctrl.register);
authRouter.post("/login", validate(loginSchema), ctrl.login);
authRouter.post("/refresh", ctrl.refresh);
authRouter.post("/logout", ctrl.logout);
