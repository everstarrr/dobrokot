import { Request, Response, NextFunction } from "express";
import * as clinicService from "../services/clinic.service";

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await clinicService.getMyProfile(req.userId!);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await clinicService.updateMyProfile(req.userId!, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await clinicService.listMyInventory(req.userId!, req.query as any);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await clinicService.createInventory(req.userId!, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function bulkCreateInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await clinicService.bulkCreateInventory(req.userId!, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await clinicService.updateInventory(
      req.userId!,
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteInventory(req: Request, res: Response, next: NextFunction) {
  try {
    await clinicService.deleteInventory(req.userId!, req.params.id as string);
    res.json({ success: true, message: "Запись удалена" });
  } catch (err) {
    next(err);
  }
}
