import { NextFunction, Request, Response } from "express";
import * as partnerService from "../services/partner.service";

export async function listPartners(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await partnerService.getPartners(req.query as any);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getPartner(req: Request, res: Response, next: NextFunction) {
  try {
    const partner = await partnerService.getPartner(Number(req.params.id));
    res.json({ success: true, data: partner });
  } catch (err) {
    next(err);
  }
}

export async function createPartner(req: Request, res: Response, next: NextFunction) {
  try {
    const partner = await partnerService.createPartner(req.body);
    res.status(201).json({ success: true, data: partner });
  } catch (err) {
    next(err);
  }
}

export async function updatePartner(req: Request, res: Response, next: NextFunction) {
  try {
    const partner = await partnerService.updatePartner(Number(req.params.id), req.body);
    res.json({ success: true, data: partner });
  } catch (err) {
    next(err);
  }
}

export async function deletePartner(req: Request, res: Response, next: NextFunction) {
  try {
    await partnerService.deletePartner(Number(req.params.id));
    res.json({ success: true, message: "Партнер удален" });
  } catch (err) {
    next(err);
  }
}

export async function listDonors(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await partnerService.getDonors(req.query as any);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getDonor(req: Request, res: Response, next: NextFunction) {
  try {
    const donor = await partnerService.getDonor(req.params.id as string);
    res.json({ success: true, data: donor });
  } catch (err) {
    next(err);
  }
}

export async function createDonor(req: Request, res: Response, next: NextFunction) {
  try {
    const donor = await partnerService.createDonor(req.body);
    res.status(201).json({ success: true, data: donor });
  } catch (err) {
    next(err);
  }
}

export async function updateDonor(req: Request, res: Response, next: NextFunction) {
  try {
    const donor = await partnerService.updateDonor(req.params.id as string, req.body);
    res.json({ success: true, data: donor });
  } catch (err) {
    next(err);
  }
}

export async function deleteDonor(req: Request, res: Response, next: NextFunction) {
  try {
    await partnerService.deleteDonor(req.params.id as string);
    res.json({ success: true, message: "Донор удален" });
  } catch (err) {
    next(err);
  }
}
