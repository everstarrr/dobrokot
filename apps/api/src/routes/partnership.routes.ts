import { Router, type Router as RouterType } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  UserRole,
  createPartnershipRequestSchema,
  listPartnershipRequestsQuerySchema,
  partnershipRequestIdParamSchema,
  provisionClinicFromRequestSchema,
  updatePartnershipRequestSchema,
} from "@dobrokot/shared";
import * as ctrl from "../controllers/partnership.controller";

export const partnershipRouter: RouterType = Router();

partnershipRouter.post(
  "/requests",
  validate(createPartnershipRequestSchema),
  ctrl.create,
);
partnershipRouter.get(
  "/requests",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(listPartnershipRequestsQuerySchema, "query"),
  ctrl.list,
);
partnershipRouter.get(
  "/requests/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(partnershipRequestIdParamSchema, "params"),
  ctrl.getOne,
);
partnershipRouter.patch(
  "/requests/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(partnershipRequestIdParamSchema, "params"),
  validate(updatePartnershipRequestSchema),
  ctrl.updateStatus,
);
partnershipRouter.post(
  "/requests/:id/provision",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(partnershipRequestIdParamSchema, "params"),
  validate(provisionClinicFromRequestSchema),
  ctrl.provision,
);
