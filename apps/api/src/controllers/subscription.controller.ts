import { Request, Response, NextFunction } from "express";
import * as subscriptionService from "../services/subscription.service";

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await subscriptionService.getSubscription(req.userId!);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function activate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await subscriptionService.activateSubscription(req.userId!, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
