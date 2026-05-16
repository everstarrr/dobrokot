import { Request, Response, NextFunction } from "express";
import * as bloodService from "../services/blood.service";

export async function check(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bloodService.checkBlood(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bloodService.searchClinicsWithBlood(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getClinic(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bloodService.getClinicWithContacts(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getClinicInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bloodService.getClinicPublicInventory(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
