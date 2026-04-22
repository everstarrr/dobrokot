import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getProfile(req.userId!);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateProfile(req.userId!, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getPublicProfile(req.params.id as string);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
