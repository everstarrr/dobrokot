import { Router, type Router as RouterType } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  UserRole,
  createDonorSchema,
  createPartnerSchema,
  donorIdParamSchema,
  listDonorsQuerySchema,
  listPartnersQuerySchema,
  partnerIdParamSchema,
  updateDonorSchema,
  updatePartnerSchema,
} from "@dobrokot/shared";
import * as ctrl from "../controllers/partners.controller";

export const partnersRouter: RouterType = Router();
export const donorsRouter: RouterType = Router();

partnersRouter.get("/", validate(listPartnersQuerySchema, "query"), ctrl.listPartners);
partnersRouter.get("/:id", validate(partnerIdParamSchema, "params"), ctrl.getPartner);
partnersRouter.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createPartnerSchema),
  ctrl.createPartner
);
partnersRouter.patch(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(partnerIdParamSchema, "params"),
  validate(updatePartnerSchema),
  ctrl.updatePartner
);
partnersRouter.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(partnerIdParamSchema, "params"),
  ctrl.deletePartner
);

donorsRouter.get("/", validate(listDonorsQuerySchema, "query"), ctrl.listDonors);
donorsRouter.get("/:id", validate(donorIdParamSchema, "params"), ctrl.getDonor);
donorsRouter.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createDonorSchema),
  ctrl.createDonor
);
donorsRouter.patch(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(donorIdParamSchema, "params"),
  validate(updateDonorSchema),
  ctrl.updateDonor
);
donorsRouter.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(donorIdParamSchema, "params"),
  ctrl.deleteDonor
);
