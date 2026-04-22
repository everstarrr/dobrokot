import { Router, type Router as RouterType } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createDonationRequestSchema,
  createDonationResponseSchema,
  sendMessageSchema,
} from "@dobrokot/shared";
import * as ctrl from "../controllers/donations.controller";

export const donationsRouter: RouterType = Router();

// Donation requests
donationsRouter.get("/requests", ctrl.getRequests);
donationsRouter.get("/requests/:id", ctrl.getRequest);
donationsRouter.post(
  "/requests",
  authenticate,
  validate(createDonationRequestSchema),
  ctrl.createRequest
);
donationsRouter.patch("/requests/:id/cancel", authenticate, ctrl.cancelRequest);

// Donation responses
donationsRouter.post(
  "/responses",
  authenticate,
  validate(createDonationResponseSchema),
  ctrl.createResponse
);
donationsRouter.patch("/responses/:id/status", authenticate, ctrl.updateResponseStatus);

// Messages
donationsRouter.get("/messages", authenticate, ctrl.getConversations);
donationsRouter.get("/messages/:userId", authenticate, ctrl.getConversation);
donationsRouter.post("/messages", authenticate, validate(sendMessageSchema), ctrl.sendMessage);
