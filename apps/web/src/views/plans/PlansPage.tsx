"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { SubscriptionPlan } from "@dobrokot/shared";
import { Badge, Button } from "@/shared/ui";
import { useAuth } from "@/features/auth/useAuth";

type Plan = {
  id: SubscriptionPlan;
  hint: string;
  title: string;
  price: string;
  features: string[];
};

const plans: Plan[] = [
  {
    id: SubscriptionPlan.WEEK,
    hint: "Мгновенный результат",
    title: "Базовый",
    price: "700₽",
    features: ["Доступ к контактам доноров на 1 неделю"],
  },
  {
    id: SubscriptionPlan.MONTH,
    hint: "Для специалистов",
    title: "Профессиональный",
    price: "1 200₽",
    features: [
      "Доступ к контактам доноров на 1 месяц",
      "Рассылка о новых поступлениях крови",
      "Доступ к базе клиник",
    ],
  },
];

const extractApiError = (
  error: unknown,
): { message: string; status?: number } => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return {
      message: payload?.error || payload?.message || error.message,
      status: error.response?.status,
    };
  }
  return {
    message: error instanceof Error ? error.message : "Не удалось активировать тариф",
  };
};

export function PlansPage() {
  const router = useRouter();
  const { isAuthenticated, purchasePlan } = useAuth();
  const [pending, setPending] = useState<SubscriptionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      router.push("/signup");
      return;
    }
    setPending(plan);
    setError(null);
    try {
      await purchasePlan(plan);
      router.push(`/plans/success?plan=${plan}`);
    } catch (err) {
      const parsed = extractApiError(err);
      if (parsed.status === 401) {
        router.push("/signin");
        return;
      }
      setError(parsed.message);
    } finally {
      setPending(null);
    }
  };

  return (
    <main className="flex flex-col gap-8 pb-10 sm:pb-15 rounded-t-3xl bg-background pt-5 sm:pt-12 sm:mx-auto sm:max-w-[calc(100%-16px)] px-1 sm:px-10">
      <div className="flex items-center flex-col gap-2.5 text-center">
        <Badge>Откроем Вам специальный раздел</Badge>
        <h1 className="text-4xl sm:text-6xl font-semibold">Тарифы</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-0 rounded-3xl bg-white sm:p-6 p-3">
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className={`flex flex-col gap-7.5 p-6 sm:py-10 sm:px-8 ${index === 0 ? "sm:border-r sm:border-stroke" : ""}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-stroke px-4 py-1.5 text-sm text-foreground/70">
                {plan.hint}
              </span>
              <span className="rounded-full bg-foreground px-4 py-1.5 text-sm text-background">
                {plan.title}
              </span>
            </div>

            <div className="flex flex-col items-center gap-5 sm:gap-7.5 mt-4 sm:mt-10 text-center">
              <p className="text-5xl sm:text-6xl font-semibold">{plan.price}</p>
              <ul className="flex flex-col gap-3 text-base text-foreground/70">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <Button
              className="mt-auto w-full"
              onClick={() => handleBuy(plan.id)}
              disabled={pending !== null}
            >
              {pending === plan.id ? "Активируем…" : "Оплатить"}
            </Button>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-accent-orange">{error}</p>
      )}
    </main>
  );
}
