import { Request, Response, NextFunction } from "express";
import type { UserRole } from "@dobrokot/shared";
import { verifyToken } from "../lib/jwt";
import { AppError } from "./errorHandler";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Требуется авторизация");
  }

  try {
    const token = header.slice(7);
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    throw new AppError(401, "Недействительный токен");
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      throw new AppError(403, "Недостаточно прав");
    }
    next();
  };
}
