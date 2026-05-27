"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { UserRole } from "@dobrokot/shared";
import { Badge, Button, Input, Select } from "@/shared/ui";
import { useAuth, type PetInfo } from "@/features/auth/useAuth";
import { apiClient, unwrapApiResponse } from "@/api/http";
import type { AuthUser } from "@/api/auth";

type OwnerFields = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

const splitName = (full: string): { firstName: string; lastName: string } => {
  const [first = "", ...rest] = full.trim().split(/\s+/);
  return { firstName: first, lastName: rest.join(" ") };
};

const extractApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return payload?.error || payload?.message || error.message;
  }
  return error instanceof Error ? error.message : "Не удалось сохранить";
};

export function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const [ownerEditing, setOwnerEditing] = useState(false);
  const [petEditing, setPetEditing] = useState(false);
  const [savingOwner, setSavingOwner] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);

  const initialOwner: OwnerFields = (() => {
    const { firstName, lastName } = splitName(auth.user?.name ?? "");
    return {
      firstName,
      lastName,
      phone: "",
      email: auth.user?.email ?? "",
    };
  })();

  const [owner, setOwner] = useState<OwnerFields>(initialOwner);
  const [pet, setPet] = useState<PetInfo>(auth.pet);

  useEffect(() => {
    if (!auth.hydrated) return;
    if (!auth.isAuthenticated) {
      router.replace("/signin");
      return;
    }
    if (auth.role === UserRole.CLINIC) {
      router.replace("/clinic");
    }
  }, [auth.hydrated, auth.isAuthenticated, auth.role, router]);

  useEffect(() => {
    const { firstName, lastName } = splitName(auth.user?.name ?? "");
    setOwner((prev) =>
      ownerEditing
        ? prev
        : {
            firstName,
            lastName,
            phone: prev.phone,
            email: auth.user?.email ?? "",
          },
    );
  }, [auth.user?.name, auth.user?.email, ownerEditing]);

  useEffect(() => {
    setPet(auth.pet);
  }, [auth.pet]);

  const heading = auth.user
    ? `${owner.firstName || ""} ${owner.lastName || ""}${pet.nickname ? `  ${pet.nickname}` : ""}`
    : "Имя Фамилия";

  const saveOwner = async () => {
    setSavingOwner(true);
    setOwnerError(null);
    try {
      const fullName = `${owner.firstName} ${owner.lastName}`.trim();
      const response = await apiClient.patch("/users/me", {
        name: fullName || undefined,
        phone: owner.phone || null,
      });
      unwrapApiResponse<AuthUser>(response);
      await auth.refreshUser();
      setOwnerEditing(false);
    } catch (err) {
      setOwnerError(extractApiError(err));
    } finally {
      setSavingOwner(false);
    }
  };

  const savePet = () => {
    auth.updatePet(pet);
    setPetEditing(false);
  };

  return (
    <main className="flex flex-col gap-8 pb-10 sm:pb-15 rounded-t-3xl bg-background pt-5 sm:pt-12 sm:mx-auto sm:max-w-[calc(100%-16px)] px-1 sm:px-10">
      <div className="flex items-center flex-col gap-2.5 text-center">
        <Badge>Это Вы!</Badge>
        <h1 className="text-3xl sm:text-5xl font-semibold">{heading}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        <section className="rounded-3xl bg-white p-5 sm:p-8 flex flex-col gap-5">
          <Badge className="self-center">Информация о хозяине питомца</Badge>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Имя
              <Input
                value={owner.firstName}
                disabled={!ownerEditing}
                placeholder="Имя"
                onChange={(event) =>
                  setOwner((prev) => ({ ...prev, firstName: event.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Фамилия
              <Input
                value={owner.lastName}
                disabled={!ownerEditing}
                placeholder="Фамилия"
                onChange={(event) =>
                  setOwner((prev) => ({ ...prev, lastName: event.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Телефон
              <Input
                value={owner.phone}
                disabled={!ownerEditing}
                placeholder="+70000000000"
                type="tel"
                onChange={(event) =>
                  setOwner((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Email
              <Input
                value={owner.email}
                disabled
                placeholder="name@example.com"
                type="email"
              />
            </label>
          </div>
          {ownerError && (
            <p className="text-sm text-accent-orange">{ownerError}</p>
          )}
          {ownerEditing ? (
            <Button onClick={saveOwner} disabled={savingOwner}>
              {savingOwner ? "Сохраняем…" : "Сохранить"}
            </Button>
          ) : (
            <Button onClick={() => setOwnerEditing(true)}>Редактировать</Button>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 sm:p-8 flex flex-col gap-5">
          <Badge className="self-center">Информация о питомце</Badge>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
              Кличка
              <Input
                value={pet.nickname ?? ""}
                disabled={!petEditing}
                placeholder="Кличка"
                onChange={(event) =>
                  setPet((prev) => ({ ...prev, nickname: event.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Вид животного
              <Select
                value={pet.species ?? "Кошка"}
                disabled={!petEditing}
                onChange={(event) =>
                  setPet((prev) => ({ ...prev, species: event.target.value }))
                }
              >
                <option>Кошка</option>
                <option>Собака</option>
              </Select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Порода
              <Input
                value={pet.breed ?? ""}
                disabled={!petEditing}
                placeholder="Порода"
                onChange={(event) =>
                  setPet((prev) => ({ ...prev, breed: event.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Возраст
              <Input
                value={pet.age ?? ""}
                disabled={!petEditing}
                placeholder="12 месяцев"
                onChange={(event) =>
                  setPet((prev) => ({ ...prev, age: event.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Вес
              <Input
                value={pet.weight ?? ""}
                disabled={!petEditing}
                placeholder="2 кг"
                onChange={(event) =>
                  setPet((prev) => ({ ...prev, weight: event.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Группа крови
              <Select
                value={pet.bloodGroup ?? "A"}
                disabled={!petEditing}
                onChange={(event) =>
                  setPet((prev) => ({ ...prev, bloodGroup: event.target.value }))
                }
              >
                <option>A</option>
                <option>B</option>
                <option>AB</option>
                <option>DEA 1.1+</option>
                <option>DEA 1.1-</option>
              </Select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Пол
              <Select
                value={pet.sex ?? "Женский"}
                disabled={!petEditing}
                onChange={(event) =>
                  setPet((prev) => ({ ...prev, sex: event.target.value }))
                }
              >
                <option>Женский</option>
                <option>Мужской</option>
              </Select>
            </label>
          </div>
          {petEditing ? (
            <Button onClick={savePet}>Сохранить</Button>
          ) : (
            <Button onClick={() => setPetEditing(true)}>Редактировать</Button>
          )}
        </section>
      </div>
    </main>
  );
}
