import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { SubscriptionPlan, type ActivateSubscriptionInput } from "@dobrokot/shared";

const PLAN_DURATION_DAYS: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.WEEK]: 7,
  [SubscriptionPlan.MONTH]: 30,
};

export async function getSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true, subscriptionExpiresAt: true },
  });

  if (!user) throw new AppError(404, "Пользователь не найден");

  const expiresAt = user.subscriptionExpiresAt;
  const isActive = !!user.subscriptionPlan && !!expiresAt && expiresAt.getTime() > Date.now();

  return {
    plan: user.subscriptionPlan,
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    isActive,
  };
}

export async function activateSubscription(userId: string, input: ActivateSubscriptionInput) {
  const days = PLAN_DURATION_DAYS[input.plan];
  if (!days) throw new AppError(400, "Неизвестный тариф");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionExpiresAt: true },
  });
  if (!user) throw new AppError(404, "Пользователь не найден");

  const now = Date.now();
  const baseMs =
    user.subscriptionExpiresAt && user.subscriptionExpiresAt.getTime() > now
      ? user.subscriptionExpiresAt.getTime()
      : now;
  const expiresAt = new Date(baseMs + days * 24 * 60 * 60 * 1000);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: input.plan,
      subscriptionExpiresAt: expiresAt,
    },
    select: { subscriptionPlan: true, subscriptionExpiresAt: true },
  });

  return {
    plan: updated.subscriptionPlan,
    expiresAt: updated.subscriptionExpiresAt
      ? updated.subscriptionExpiresAt.toISOString()
      : null,
    isActive: true,
  };
}
