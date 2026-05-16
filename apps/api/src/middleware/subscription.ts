import { Request, Response, NextFunction } from "express";
import { UserRole } from "@dobrokot/shared";
import { prisma } from "../lib/prisma";
import { AppError } from "./errorHandler";

export async function requireActiveSubscription(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.userId) {
    throw new AppError(401, "Требуется авторизация");
  }

  // Clinics and admins have access without subscription
  if (req.userRole === UserRole.CLINIC || req.userRole === UserRole.ADMIN) {
    next();
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { subscriptionPlan: true, subscriptionExpiresAt: true },
  });

  if (!user) {
    throw new AppError(401, "Пользователь не найден");
  }

  const isActive =
    !!user.subscriptionPlan &&
    !!user.subscriptionExpiresAt &&
    user.subscriptionExpiresAt.getTime() > Date.now();

  if (!isActive) {
    throw new AppError(402, "Требуется активная подписка");
  }

  next();
}
