import { Router, type Router as RouterType } from "express";
import { authenticate } from "../middleware/auth";
import { requireActiveSubscription } from "../middleware/subscription";
import { validate } from "../middleware/validate";
import {
  bloodCheckSchema,
  bloodSearchSchema,
  clinicIdParamSchema,
} from "@dobrokot/shared";
import * as ctrl from "../controllers/blood.controller";

export const bloodRouter: RouterType = Router();

bloodRouter.post("/check", validate(bloodCheckSchema), ctrl.check);
bloodRouter.post(
  "/search",
  authenticate,
  requireActiveSubscription,
  validate(bloodSearchSchema),
  ctrl.search,
);

export const clinicsPublicRouter: RouterType = Router();

clinicsPublicRouter.get(
  "/:id",
  authenticate,
  requireActiveSubscription,
  validate(clinicIdParamSchema, "params"),
  ctrl.getClinic,
);
clinicsPublicRouter.get(
  "/:id/blood",
  authenticate,
  requireActiveSubscription,
  validate(clinicIdParamSchema, "params"),
  ctrl.getClinicInventory,
);
