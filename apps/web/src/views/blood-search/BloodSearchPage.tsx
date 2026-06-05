"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowUpRight, Droplet } from "lucide-react";
import {
  AnimalType,
  type BloodSearchClinicResult,
  type PaginatedResponse,
} from "@dobrokot/shared";
import { Badge, Button } from "@/shared/ui";
import {
  BloodCheckForm,
  type BloodCheckValues,
} from "@/features/blood-search/BloodCheckForm";
import { searchBlood } from "@/api/blood";
import { useAuth } from "@/features/auth/useAuth";

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
    message: error instanceof Error ? error.message : "Не удалось загрузить клиники",
  };
};

const ClinicCard = ({ row }: { row: BloodSearchClinicResult }) => (
  <article className="flex flex-col gap-4 rounded-3xl bg-white p-4">
    <Badge className="self-start">Подходящий донор</Badge>
    <div className="flex h-28 items-center justify-center">
      {row.clinic.avatarUrl ? (
        <Image
          src={row.clinic.avatarUrl}
          alt={row.clinic.title}
          width={200}
          height={80}
          className="max-h-20 w-auto object-contain"
        />
      ) : (
        <div className="text-2xl font-semibold text-foreground/70">
          {row.clinic.title}
        </div>
      )}
    </div>
    <div className="flex items-start justify-between gap-2">
      <p className="text-lg font-semibold">{row.clinic.title}</p>
      {row.clinic.workingHours && (
        <p className="text-xs text-foreground/60">{row.clinic.workingHours}</p>
      )}
    </div>
    <div className="flex flex-wrap gap-2 items-center text-sm">
      <span className="flex items-center gap-1 text-accent-orange font-medium">
        <Droplet size={14} fill="currentColor" /> {row.matchedUnits} ед.
      </span>
      {row.totalVolumeMl > 0 && (
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
          {row.totalVolumeMl} мл
        </span>
      )}
      {row.distanceKm != null && (
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
          {row.distanceKm.toFixed(1)} км
        </span>
      )}
    </div>
    <p className="text-sm text-foreground/70">
      {[row.clinic.city, row.clinic.address].filter(Boolean).join(", ") || "Адрес не указан"}
    </p>
    <a href={row.clinic.phone ? `tel:${row.clinic.phone}` : "#"}>
      <Button variant="outline" className="w-full">
        Обратиться в клинику
        <ArrowUpRight size={18} />
      </Button>
    </a>
  </article>
);

export function BloodSearchPage() {
  const router = useRouter();
  const auth = useAuth();
  const [data, setData] = useState<PaginatedResponse<BloodSearchClinicResult> | null>(
    null,
  );
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    if (!auth.hydrated) return;
    if (!auth.isAuthenticated) {
      router.replace("/signup");
    }
  }, [auth.hydrated, auth.isAuthenticated, router]);

  if (!auth.hydrated || !auth.isAuthenticated) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-foreground/70">
        <p className="text-sm">Проверяем доступ…</p>
      </main>
    );
  }

  const mutation = useMutation({
    mutationFn: searchBlood,
    onSuccess: (payload) => {
      setData(payload);
      setFiltersApplied(true);
    },
  });

  const onSubmit = async (values: BloodCheckValues) => {
    await mutation.mutateAsync({
      animalType: values.animalType,
      bloodType: values.bloodType,
    });
  };

  const error = mutation.error ? extractApiError(mutation.error) : null;
  const needAuth = error?.status === 401;
  const needSubscription = error?.status === 402;

  return (
    <main className="flex flex-col gap-10 pb-10 sm:pb-15 rounded-t-3xl bg-background pt-5 sm:pt-10 sm:mx-auto sm:max-w-[calc(100%-16px)] px-1 sm:px-10">
      <section className="rounded-3xl bg-white p-5 sm:p-8 flex flex-col gap-5">
        <Badge className="self-center">Информация о питомце</Badge>
        <BloodCheckForm
          submitLabel={filtersApplied ? "Обновить поиск" : "Найти"}
          loading={mutation.isPending}
          onSubmit={onSubmit}
        />
        {needAuth && (
          <p className="text-sm text-accent-orange">
            Для поиска войдите в аккаунт.{" "}
            <Link href="/signin" className="underline">
              Войти
            </Link>
          </p>
        )}
        {needSubscription && (
          <p className="text-sm text-accent-orange">
            Нужна активная подписка.{" "}
            <Link href="/plans" className="underline">
              Выбрать тариф
            </Link>
          </p>
        )}
        {error && !needAuth && !needSubscription && (
          <p className="text-sm text-accent-orange">{error.message}</p>
        )}
      </section>

      {data && (
        <>
          <div className="flex flex-col items-center gap-2.5 text-center">
            <Badge variant="biege">
              {auth.subscription?.expiresAt
                ? `Контакты доступны до ${new Date(auth.subscription.expiresAt).toLocaleDateString("ru-RU")}`
                : "Контакты доступны"}
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-semibold">
              {data.items.length > 0 ? "Доступные клиники" : "Клиники не найдены"}
            </h2>
            {data.total > 0 && (
              <p className="text-foreground/70 text-sm">
                Найдено: {data.total}
              </p>
            )}
          </div>

          {data.items.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
              {data.items.map((row) => (
                <ClinicCard key={row.clinic.id} row={row} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
