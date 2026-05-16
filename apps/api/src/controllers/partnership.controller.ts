import { Request, Response, NextFunction } from "express";
import * as partnershipService from "../services/partnership.service";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await partnershipService.createRequest(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await partnershipService.listRequests(req.query as any);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await partnershipService.getRequest(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await partnershipService.updateRequestStatus(
      req.params.id as string,
      req.userId!,
      req.body,
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function provision(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await partnershipService.provisionClinicFromRequest(
      req.params.id as string,
      req.userId!,
      req.body ?? {},
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
