import { Router, type Router as RouterType } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { activateSubscriptionSchema } from "@dobrokot/shared";
import * as ctrl from "../controllers/subscription.controller";

export const subscriptionRouter: RouterType = Router();

subscriptionRouter.get("/me", authenticate, ctrl.getMe);
subscriptionRouter.post(
  "/activate",
  authenticate,
  validate(activateSubscriptionSchema),
  ctrl.activate,
);
