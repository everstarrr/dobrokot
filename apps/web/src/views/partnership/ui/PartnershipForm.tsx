"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button, Checkbox, Input } from "@/shared/ui";
import { submitPartnershipRequest } from "@/api/partnership";

type FormValues = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  clinicTitle: string;
  city: string;
  message: string;
  agree: boolean;
};

const initialValues: FormValues = {
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  clinicTitle: "",
  city: "",
  message: "",
  agree: true,
};

const extractApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return payload?.error || payload?.message || error.message;
  }
  return error instanceof Error ? error.message : "Не удалось отправить заявку";
};

export const PartnershipForm = () => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: submitPartnershipRequest,
    onSuccess: () => {
      setSubmitted(true);
      setValues(initialValues);
    },
  });

  const set = <K extends keyof FormValues>(name: K, value: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate({
      contactName: values.contactName,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone || undefined,
      clinicTitle: values.clinicTitle,
      city: values.city || undefined,
      message: values.message || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 text-center flex flex-col gap-3">
        <h3 className="text-2xl font-semibold">Заявка отправлена!</h3>
        <p className="text-foreground/70">
          Мы свяжемся с вами в ближайшее время по указанным контактам.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Отправить ещё одну
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 flex flex-col gap-5"
    >
      <h3 className="text-2xl sm:text-3xl font-semibold text-center">
        Заявка на партнёрство
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Имя контактного лица
          <Input
            placeholder="Имя"
            value={values.contactName}
            onChange={(event) => set("contactName", event.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Название клиники / организации
          <Input
            placeholder="Клиника"
            value={values.clinicTitle}
            onChange={(event) => set("clinicTitle", event.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Email
          <Input
            type="email"
            placeholder="name@example.com"
            value={values.contactEmail}
            onChange={(event) => set("contactEmail", event.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Телефон
          <Input
            type="tel"
            inputMode="tel"
            placeholder="+70000000000"
            value={values.contactPhone}
            onChange={(event) => set("contactPhone", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
          Город
          <Input
            placeholder="Москва"
            value={values.city}
            onChange={(event) => set("city", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
          Сообщение
          <textarea
            className="rounded-xl border border-stroke bg-white p-3 text-base outline-none transition-colors placeholder:text-typography-inactive"
            placeholder="Расскажите о своей организации"
            rows={4}
            maxLength={2000}
            value={values.message}
            onChange={(event) => set("message", event.target.value)}
          />
        </label>
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <Checkbox
          checked={values.agree}
          onCheckedChange={(checked) => set("agree", checked === true)}
        />
        <span>
          Я согласен с{" "}
          <a href="#" className="text-accent-orange">
            условиями обработки персональных данных
          </a>
        </span>
      </label>
      {mutation.isError && (
        <p className="text-sm text-accent-orange">
          {extractApiError(mutation.error)}
        </p>
      )}
      <Button type="submit" disabled={!values.agree || mutation.isPending}>
        {mutation.isPending ? "Отправляем…" : "Отправить заявку"}
      </Button>
    </form>
  );
};
