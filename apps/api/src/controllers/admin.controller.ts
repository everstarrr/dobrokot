import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";

export async function createClinicAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.createClinicAccount(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
