import { Router, type Router as RouterType } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { UserRole, createClinicAccountSchema } from "@dobrokot/shared";
import * as ctrl from "../controllers/admin.controller";

export const adminRouter: RouterType = Router();

adminRouter.use(authenticate, authorize(UserRole.ADMIN));

adminRouter.post(
  "/clinics",
  validate(createClinicAccountSchema),
  ctrl.createClinicAccount,
);
