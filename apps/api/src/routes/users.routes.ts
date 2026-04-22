import { Router, type Router as RouterType } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "@dobrokot/shared";
import * as ctrl from "../controllers/users.controller";

export const usersRouter: RouterType = Router();

usersRouter.get("/me", authenticate, ctrl.getMe);
usersRouter.patch("/me", authenticate, validate(updateProfileSchema), ctrl.updateMe);
usersRouter.get("/:id", ctrl.getUser);
