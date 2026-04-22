"use client";

import dynamic from "next/dynamic";
import { Info, Search } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { useDonorsQuery } from "@/api/donors";
import { useGeocodingQuery } from "@/api/geocoding";
import { Input, ScrollArea } from "@/shared/ui";
import { DonorCard } from "./DonorCard";

const SelectedDonorMap = dynamic(
  () => import("./SelectedDonorMap").then((module) => module.SelectedDonorMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-105 items-center justify-center rounded-3xl bg-secondary px-6 text-center text-sm text-foreground/70">
        Загружаем данные карты...
      </div>
    ),
  },
);

export function MapSection() {
  const [search, setSearch] = useState("");
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search.trim());

  const donorsQuery = useDonorsQuery({
    search: deferredSearch || undefined,
  });

  const donors = donorsQuery.data?.items ?? [];

  useEffect(() => {
    if (!donors.length) {
      setSelectedDonorId(null);
      return;
    }

    setSelectedDonorId((currentId) =>
      currentId && donors.some((donor) => donor.id === currentId)
        ? currentId
        : donors[0].id,
    );
  }, [donors]);

  const selectedDonor =
    donors.find((donor) => donor.id === selectedDonorId) ?? null;
  const locationQuery = useGeocodingQuery(selectedDonor?.address);
  const geocodedLocation = locationQuery.data;

  function renderMapCard(mapClassName?: string) {
    if (!selectedDonor) {
      return (
        <div className="flex h-75 items-center justify-center px-6 text-center text-sm text-foreground/70 lg:h-full">
          Выберите донора из списка, чтобы посмотреть его местоположение на
          карте.
        </div>
      );
    }

    if (locationQuery.isLoading) {
      return (
        <div className="flex h-75 items-center justify-center px-6 text-center text-sm text-foreground/70 lg:h-full">
          Определяем адрес и подгружаем карту для {selectedDonor.title}.
        </div>
      );
    }

    if (locationQuery.isError) {
      return (
        <div className="flex h-75 items-center justify-center px-6 text-center text-sm text-foreground/70 lg:h-full">
          Не удалось определить координаты для адреса "
          {selectedDonor.address}".
        </div>
      );
    }

    if (geocodedLocation === null) {
      return (
        <div className="flex h-75 items-center justify-center px-6 text-center text-sm text-foreground/70 lg:h-full">
          Для адреса "{selectedDonor.address}" не удалось найти координаты.
        </div>
      );
    }

    if (!geocodedLocation) {
      return (
        <div className="flex h-75 items-center justify-center px-6 text-center text-sm text-foreground/70 lg:h-full">
          Карта для {selectedDonor.title} еще не готова. Попробуйте выбрать
          другого донора или подождите немного.
        </div>
      );
    }

    return (
      <SelectedDonorMap
        donor={selectedDonor}
        latitude={geocodedLocation.latitude}
        longitude={geocodedLocation.longitude}
        resolvedAddress={geocodedLocation.label}
        className={mapClassName}
      />
    );
  }

  function renderDonorList(showInlineMap: boolean) {
    return (
      <div className="space-y-3">
        {donorsQuery.isLoading && (
          <div className="rounded-[20px] border border-dashed border-stroke bg-white px-4 py-6 text-sm text-foreground/70">
            Загружаем список доноров...
          </div>
        )}

        {donorsQuery.isError && (
          <div className="rounded-[20px] border border-dashed border-stroke bg-white px-4 py-6 text-sm text-foreground/70">
            Не удалось получить список доноров. Попробуйте обновить страницу
            чуть позже.
          </div>
        )}

        {!donorsQuery.isLoading &&
          !donorsQuery.isError &&
          donors.length === 0 && (
            <div className="rounded-[20px] border border-dashed border-stroke bg-white px-4 py-6 text-sm text-foreground/70">
              По вашему запросу пока ничего не найдено.
            </div>
          )}

        {donors.map((donor) => {
          const isActive = donor.id === selectedDonorId;

          return (
            <div key={donor.id} className="space-y-3">
              <DonorCard
                donor={donor}
                isActive={isActive}
                onSelect={setSelectedDonorId}
              />

              {showInlineMap && isActive && (
                <div className="overflow-hidden rounded-3xl border border-stroke bg-background">
                  {renderMapCard()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-8xl rounded-3xl bg-white p-1 sm:p-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <div className="flex min-w-0 flex-col gap-4 sm:max-w-116 sm:w-full">
          <h1 className="inline-flex w-full items-center justify-center gap-2.5 px-4 py-4 text-xl font-medium text-foreground sm:justify-between sm:px-0">
            <Info className="text-transparent" size={24} />
            Карта доноров
            <Info size={24} />
          </h1>

          <div className="relative">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Название клиники или адрес донора"
              className="pr-12"
            />
            <Search size={24} className="absolute right-3 top-3 text-muted" />
          </div>

          <div className="lg:hidden">{renderDonorList(true)}</div>

          <ScrollArea className="hidden sm:block sm:max-h-153">
            <div className="space-y-2.5 sm:max-h-189">
              {renderDonorList(false)}
            </div>
          </ScrollArea>
        </div>

        <div className="hidden min-w-0 overflow-hidden rounded-xl bg-background sm:flex sm:min-h-189 sm:flex-1 sm:flex-col">
          <div className="flex-1 overflow-hidden">
            {renderMapCard("h-full min-h-[38rem]")}
          </div>
        </div>
      </div>
    </section>
  );
}
