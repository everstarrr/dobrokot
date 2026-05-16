import { Router, type Router as RouterType } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  UserRole,
  bloodInventoryIdParamSchema,
  bulkBloodInventorySchema,
  createBloodInventorySchema,
  listBloodInventoryQuerySchema,
  updateBloodInventorySchema,
  updateClinicProfileSchema,
} from "@dobrokot/shared";
import * as ctrl from "../controllers/clinic.controller";

export const clinicRouter: RouterType = Router();

clinicRouter.use(authenticate, authorize(UserRole.CLINIC));

clinicRouter.get("/me", ctrl.getProfile);
clinicRouter.patch("/me", validate(updateClinicProfileSchema), ctrl.updateProfile);

clinicRouter.get(
  "/me/blood",
  validate(listBloodInventoryQuerySchema, "query"),
  ctrl.listInventory,
);
clinicRouter.post(
  "/me/blood",
  validate(createBloodInventorySchema),
  ctrl.createInventory,
);
clinicRouter.post(
  "/me/blood/bulk",
  validate(bulkBloodInventorySchema),
  ctrl.bulkCreateInventory,
);
clinicRouter.patch(
  "/me/blood/:id",
  validate(bloodInventoryIdParamSchema, "params"),
  validate(updateBloodInventorySchema),
  ctrl.updateInventory,
);
clinicRouter.delete(
  "/me/blood/:id",
  validate(bloodInventoryIdParamSchema, "params"),
  ctrl.deleteInventory,
);
