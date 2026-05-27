"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/shared/ui";
import { PartnersSection } from "@/views/main/ui/PartnersSection";
import { PartnershipForm } from "./ui/PartnershipForm";

type ActionCard = {
  id: string;
  title: string;
  image: string;
  className: string;
};

const actionCards: ActionCard[] = [
  {
    id: "offer",
    title: "Предложить сотрудничество",
    image: "/partnership1.png",
    className: "sm:col-span-1 sm:row-span-1 aspect-square",
  },
  {
    id: "list",
    title: "Список партнёров, кто уже с нами",
    image: "/partnership2.png",
    className: "sm:col-span-1 sm:row-span-1 aspect-square",
  },
  {
    id: "support",
    title: "Задать вопрос о партнёрстве",
    image: "/partnership3.png",
    className: "sm:col-span-2 sm:row-span-1 aspect-[2.4/1]",
  },
];

function PartnershipPage() {
  const [formOpen, setFormOpen] = useState(false);

  const openForm = () => {
    setFormOpen(true);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document
          .getElementById("partnership-form")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <main className="flex flex-col gap-10 sm:gap-15 pb-10 sm:pb-15 rounded-t-3xl bg-background pt-5 sm:pt-12 sm:mx-auto sm:max-w-[calc(100%-16px)] px-1 sm:px-10">
      <div className="flex items-center flex-col gap-2.5 text-center">
        <Badge>Возможности</Badge>
        <h1 className="text-4xl sm:text-6xl font-semibold">Партнёрство</h1>
        <p className="text-foreground/70 text-sm max-w-md">
          Мы открыты к сотрудничеству с ветеринарными клиниками, фондами,
          приютами
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-5">
        <button
          type="button"
          onClick={openForm}
          className={`group relative overflow-hidden rounded-3xl bg-secondary text-left sm:col-span-1 sm:row-span-1 aspect-square`}
        >
          <Image
            src="/partnership1.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span
            aria-hidden="true"
            className="absolute right-4 top-4 inline-flex size-13 items-center justify-center rounded-full bg-white text-foreground"
          >
            <ArrowUpRight size={22} />
          </span>
          <span className="absolute inset-x-5 bottom-5 text-white text-xl sm:text-2xl font-medium drop-shadow-lg">
            Предложить сотрудничество
          </span>
        </button>
        <button
          type="button"
          onClick={openForm}
          className={`group relative overflow-hidden rounded-3xl bg-secondary text-left sm:col-span-1 sm:row-span-1 aspect-square`}
        >
          <Image
            src="/partnership2.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span
            aria-hidden="true"
            className="absolute right-4 top-4 inline-flex size-13 items-center justify-center rounded-full bg-white text-foreground"
          >
            <ArrowUpRight size={22} />
          </span>
          <span className="absolute inset-x-5 bottom-5 text-white text-xl sm:text-2xl font-medium drop-shadow-lg">
            Список партнеров, кто уже с нами
          </span>
        </button>

        <div className="relative overflow-hidden rounded-3xl bg-secondary sm:col-span-2 sm:row-span-2 aspect-5/4 sm:aspect-auto">
          <Image
            src="/partnership4.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
        <button
          type="button"
          onClick={openForm}
          className={`group relative overflow-hidden rounded-3xl bg-secondary text-left sm:col-span-2 sm:row-span-1 aspect-square max-h-89 w-full`}
        >
          <Image
            src="/partnership3.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span
            aria-hidden="true"
            className="absolute right-4 top-4 inline-flex size-13 items-center justify-center rounded-full bg-white text-foreground"
          >
            <ArrowUpRight size={22} />
          </span>
          <span className="absolute inset-x-5 bottom-5 text-white text-xl sm:text-2xl font-medium drop-shadow-lg">
            Задать вопрос о партнерстве
          </span>
        </button>
      </div>

      {formOpen && (
        <div id="partnership-form" className="scroll-mt-28">
          <PartnershipForm />
        </div>
      )}

      <PartnersSection />
    </main>
  );
}

export default PartnershipPage;
