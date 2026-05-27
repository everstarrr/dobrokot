"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { BloodCheckForm } from "@/features/blood-search/BloodCheckForm";
import { BloodResultModal } from "@/features/blood-search/BloodResultModal";
import { checkBlood, type BloodCheckResult } from "@/api/blood";

const extractApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return payload?.error || payload?.message || error.message;
  }
  return error instanceof Error ? error.message : "Не удалось проверить наличие";
};

export const BloodCheckSection = () => {
  const [result, setResult] = useState<BloodCheckResult | null>(null);
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: checkBlood,
    onSuccess: (data) => {
      setResult(data);
      setOpen(true);
    },
  });

  return (
    <section
      id="blood-check"
      className="w-full px-1 sm:max-w-[calc(100%-16px)] sm:mx-auto"
    >
      <div className="rounded-3xl bg-white p-5 sm:p-10 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 items-start">
        <div className="flex flex-col gap-5 sm:gap-7.5">
          <h2 className="text-3xl sm:text-5xl font-semibold leading-tight">
            Бесплатно проверим наличие крови в клиниках
          </h2>
          <p className="text-foreground/70 text-sm sm:text-base">
            Укажите информацию о Вашем питомце. Добавьте имя, карту здоровья,
            контактную информацию о хозяине
          </p>
          <div className="relative hidden sm:block w-full max-w-md mt-auto">
            <Image
              src="/how_it_works1.png"
              alt=""
              width={520}
              height={380}
              className="rounded-2xl object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <BloodCheckForm
            loading={mutation.isPending}
            onSubmit={async (values) => {
              await mutation.mutateAsync({
                animalType: values.animalType,
                bloodType: values.bloodType,
              });
            }}
          />
          {mutation.isError && (
            <p className="text-sm text-accent-orange">
              {extractApiError(mutation.error)}
            </p>
          )}
        </div>

        <div className="sm:hidden">
          <Image
            src="/how_it_works1.png"
            alt=""
            width={520}
            height={380}
            className="w-full rounded-2xl object-cover"
          />
        </div>
      </div>

      <BloodResultModal
        open={open}
        onClose={() => setOpen(false)}
        variant={result?.available ? "found" : "not-found"}
        matchCount={result?.clinicsCount ?? 0}
      />
    </section>
  );
};
