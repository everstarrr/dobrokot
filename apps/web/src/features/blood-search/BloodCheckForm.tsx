"use client";

import { useEffect, useState } from "react";
import { AnimalType, BloodProductType, PlasmaSubtype } from "@dobrokot/shared";
import { cn } from "@/app/shared/lib/utils";
import { Button, Checkbox, Input, Select } from "@/shared/ui";
import { bloodTypeOptionsByAnimal, plasmaSubtypeOptions } from "@/api/blood";

export type BloodCheckValues = {
  nickname: string;
  animalType: AnimalType;
  breed: string;
  age: string;
  weight: string;
  bloodType: string;
  productType: BloodProductType;
  plasmaSubtype: PlasmaSubtype | "";
  sex: string;
  vaccinated: boolean;
};

const defaultValues: BloodCheckValues = {
  nickname: "",
  animalType: AnimalType.CAT,
  breed: "",
  age: "",
  weight: "",
  bloodType: bloodTypeOptionsByAnimal[AnimalType.CAT][0].value,
  productType: BloodProductType.BLOOD,
  plasmaSubtype: "",
  sex: "Женский",
  vaccinated: true,
};

const animalLabel: Record<AnimalType, string> = {
  [AnimalType.CAT]: "Кошка",
  [AnimalType.DOG]: "Собака",
};

const productTabs: { value: BloodProductType; label: string }[] = [
  { value: BloodProductType.BLOOD, label: "Кровь" },
  { value: BloodProductType.PLASMA, label: "Плазма" },
];

type Props = {
  onSubmit: (values: BloodCheckValues) => void | Promise<void>;
  submitLabel?: string;
  initialValues?: Partial<BloodCheckValues>;
  loading?: boolean;
};

export const BloodCheckForm = ({
  onSubmit,
  submitLabel = "Проверить наличие",
  initialValues,
  loading,
}: Props) => {
  const [values, setValues] = useState<BloodCheckValues>({
    ...defaultValues,
    ...initialValues,
  });

  useEffect(() => {
    const available = bloodTypeOptionsByAnimal[values.animalType];
    if (!available.some((option) => option.value === values.bloodType)) {
      setValues((prev) => ({ ...prev, bloodType: available[0].value }));
    }
  }, [values.animalType, values.bloodType]);

  // При переключении на «Кровь» сбрасываем подтип плазмы.
  useEffect(() => {
    if (values.productType === BloodProductType.BLOOD && values.plasmaSubtype) {
      setValues((prev) => ({ ...prev, plasmaSubtype: "" }));
    }
  }, [values.productType, values.plasmaSubtype]);

  const set = <K extends keyof BloodCheckValues>(name: K, value: BloodCheckValues[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
  };

  const bloodOptions = bloodTypeOptionsByAnimal[values.animalType];
  const isPlasma = values.productType === BloodProductType.PLASMA;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div className="flex w-full rounded-full bg-secondary p-1">
        {productTabs.map((tab) => {
          const active = values.productType === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => set("productType", tab.value)}
              className={cn(
                "flex-1 rounded-full py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">
        <label className="sm:col-span-2 flex flex-col gap-1.5 text-sm font-medium text-typography">
          Кличка
          <Input
            placeholder="Кличка"
            value={values.nickname}
            onChange={(event) => set("nickname", event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-typography">
          Вид животного
          <Select
            value={values.animalType}
            onChange={(event) => set("animalType", event.target.value as AnimalType)}
          >
            <option value={AnimalType.CAT}>{animalLabel[AnimalType.CAT]}</option>
            <option value={AnimalType.DOG}>{animalLabel[AnimalType.DOG]}</option>
          </Select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-typography">
          Порода
          <Input
            placeholder="Британская"
            value={values.breed}
            onChange={(event) => set("breed", event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-typography">
          Возраст
          <Input
            placeholder="12 месяцев"
            value={values.age}
            onChange={(event) => set("age", event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-typography">
          Вес
          <Input
            placeholder="2 кг"
            value={values.weight}
            onChange={(event) => set("weight", event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-typography">
          Группа крови
          <Select
            value={values.bloodType}
            onChange={(event) => set("bloodType", event.target.value)}
          >
            {bloodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        {isPlasma && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-typography">
            Тип плазмы
            <Select
              value={values.plasmaSubtype}
              onChange={(event) =>
                set(
                  "plasmaSubtype",
                  event.target.value === ""
                    ? ""
                    : (event.target.value as PlasmaSubtype),
                )
              }
            >
              <option value="">Любой</option>
              {plasmaSubtypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-typography">
          Пол
          <Select value={values.sex} onChange={(event) => set("sex", event.target.value)}>
            <option value="Женский">Женский</option>
            <option value="Мужской">Мужской</option>
          </Select>
        </label>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-typography">
        <Checkbox
          checked={values.vaccinated}
          onCheckedChange={(checked) => set("vaccinated", checked === true)}
        />
        Питомец привит
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? "Проверяем…" : submitLabel}
      </Button>
    </form>
  );
};
