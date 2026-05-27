"use client";

import { useEffect, useState } from "react";
import { Paperclip } from "lucide-react";
import { Badge, Button, Input } from "@/shared/ui";
import { useAuth } from "@/features/auth/useAuth";

type ClinicFields = {
  clinicName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

const splitName = (full: string): { firstName: string; lastName: string } => {
  const [first = "", ...rest] = full.trim().split(/\s+/);
  return { firstName: first, lastName: rest.join(" ") };
};

const CLINIC_STORAGE_KEY = "dobrokot:clinic";

const readClinic = (): Partial<ClinicFields> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CLINIC_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<ClinicFields>) : {};
  } catch {
    return {};
  }
};

const writeClinic = (values: ClinicFields) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLINIC_STORAGE_KEY, JSON.stringify(values));
};

export function ClinicPage() {
  const auth = useAuth();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<ClinicFields>(() => {
    const stored = readClinic();
    const { firstName, lastName } = splitName(auth.user?.name ?? "");
    return {
      clinicName: stored.clinicName ?? "",
      firstName: stored.firstName ?? firstName,
      lastName: stored.lastName ?? lastName,
      phone: stored.phone ?? "",
      email: stored.email ?? auth.user?.email ?? "",
    };
  });
  const [coverName, setCoverName] = useState<string | null>(null);
  const [donorsCsvName, setDonorsCsvName] = useState<string | null>(null);

  useEffect(() => {
    if (editing) return;
    const stored = readClinic();
    const { firstName, lastName } = splitName(auth.user?.name ?? "");
    setValues({
      clinicName: stored.clinicName ?? "",
      firstName: stored.firstName ?? firstName,
      lastName: stored.lastName ?? lastName,
      phone: stored.phone ?? "",
      email: stored.email ?? auth.user?.email ?? "",
    });
  }, [auth.user?.name, auth.user?.email, editing]);

  const save = () => {
    writeClinic(values);
    setEditing(false);
  };

  const heading = values.clinicName || "Доброкот";

  return (
    <main className="flex flex-col gap-8 pb-10 sm:pb-15 rounded-t-3xl bg-background pt-5 sm:pt-12 sm:mx-auto sm:max-w-[calc(100%-16px)] px-1 sm:px-10">
      <div className="flex items-center flex-col gap-2.5 text-center">
        <Badge>Это Вы!</Badge>
        <h1 className="text-3xl sm:text-5xl font-semibold">{heading}</h1>
      </div>

      <section className="rounded-3xl bg-white p-5 sm:p-8 flex flex-col gap-5">
        <Badge className="self-center">Информация о клинике</Badge>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Название клиники
          <Input
            value={values.clinicName}
            disabled={!editing}
            placeholder="Название"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, clinicName: event.target.value }))
            }
          />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Имя
            <Input
              value={values.firstName}
              disabled={!editing}
              placeholder="Имя"
              onChange={(event) =>
                setValues((prev) => ({ ...prev, firstName: event.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Фамилия
            <Input
              value={values.lastName}
              disabled={!editing}
              placeholder="Фамилия"
              onChange={(event) =>
                setValues((prev) => ({ ...prev, lastName: event.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Телефон
            <Input
              value={values.phone}
              disabled={!editing}
              placeholder="+70000000000"
              type="tel"
              onChange={(event) =>
                setValues((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <Input
              value={values.email}
              disabled
              placeholder="name@example.com"
              type="email"
            />
          </label>
        </div>

        <div className="flex flex-col gap-1.5 text-sm font-medium">
          Фото
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-stroke p-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-foreground/30 px-4 text-sm font-medium text-foreground hover:bg-foreground hover:text-background transition-colors">
              <Paperclip size={16} />
              Прикрепить файл
              <input
                type="file"
                className="hidden"
                disabled={!editing}
                accept="image/*"
                onChange={(event) =>
                  setCoverName(event.target.files?.[0]?.name ?? null)
                }
              />
            </label>
            <p className="text-xs text-foreground/60 leading-snug">
              {coverName ??
                "Перетащите сюда изображение, которое будет обложкой вашей работы. Минимальный размер 800px на 600px, вес не более 1.5 мб"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-sm font-medium">
          CSV-файл с данными доноров
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-stroke p-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-foreground/30 px-4 text-sm font-medium text-foreground hover:bg-foreground hover:text-background transition-colors">
              <Paperclip size={16} />
              Прикрепить файл
              <input
                type="file"
                className="hidden"
                disabled={!editing}
                accept=".csv"
                onChange={(event) =>
                  setDonorsCsvName(event.target.files?.[0]?.name ?? null)
                }
              />
            </label>
            <p className="text-xs text-foreground/60 leading-snug">
              {donorsCsvName ?? "Перетащите сюда CSV-файл с данными доноров"}
            </p>
          </div>
        </div>

        {editing ? (
          <Button onClick={save}>Сохранить</Button>
        ) : (
          <Button onClick={() => setEditing(true)}>Редактировать</Button>
        )}
      </section>
    </main>
  );
}
