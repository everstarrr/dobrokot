"use client"
import Image from "next/image";
import { Button } from "../ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/app/shared/lib/utils";
import { usePathname } from "next/navigation";

export const Footer = () => {

  const pathname = usePathname();

  return (
    <footer className={cn("bg-foreground text-white flex flex-col gap-5 sm:gap-0 items-center rounded-3xl relative sm:w-[calc(100%-16px)] mx-auto sm:mb-2", pathname !== "/" && "sm:border-8 sm:border-background rounded-t-none")}>
        <div className="absolute top-0 w-full bg-background h-5 -z-10"/>

      <div className="flex flex-col sm:flex-row gap-6 sm:px-14 sm:py-15">
        <div className="flex flex-col gap-7.5 items-center sm:items-start w-full p-2 sm:flex-1">
          <Image src="/logo_white.svg" alt="" width={101} height={58} />
          <div className="flex flex-col gap-7.5 w-full">
            <p>
              Доброкот - сервис по оперативному поиску доноров крови и плазмы
              для домашних животных
            </p>
            <div className="flex max-sm:mx-auto">
              <Button variant="white" size="icon">
                <Image
                  src="/dzen.svg"
                  alt="Dzen"
                  width={28}
                  height={28}
                  className="size-auto!"
                />
              </Button>
              <Button variant="white" size="icon">
                <Image
                  src="/vk.svg"
                  alt="VK"
                  width={28}
                  height={28}
                  className="size-auto!"
                />
              </Button>
              <Button variant="white" size="icon">
                <Image
                  src="/max.svg"
                  alt="Max"
                  width={28}
                  height={28}
                  className="size-auto!"
                />
              </Button>
            </div>
            <p>
              Напишите нам на{" "}
              <span className="font-semibold text-accent-orange">
                info@dobrokot.com
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 px-2 pb-2 sm:flex-1">
          <div className="flex flex-col gap-4 sm:gap-7.5">
            <p className="font-medium">Навигация</p>
            <div className="flex flex-col gap-2.5 sm:gap-4">
              <Link href="/">Проект</Link>
              <Link href="/results">Наши результаты</Link>
              <Link href="/map">Карта доноров</Link>
              <Link href="/">Партнёрство</Link>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:gap-7.5">
            <p className="font-medium">Блог</p>
            <div className="flex flex-col gap-2.5 sm:gap-4">
              <Link href="/">Почему с нами найти донора легче</Link>
              <Link href="/">Разбор кейсов с реальными историями</Link>
              <Link href="/">Как работает наша платформа</Link>
              <Link href="/">С какими партнёрами мы сотрудничаем?</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-accent-orange py-4 px-2 flex w-full sm:justify-center">
        <Button variant="outlineWhite" className="max-sm:flex-1">
          Найти донора
        </Button>
        <Button variant="outlineWhite" size="icon">
          <ArrowRight />
        </Button>
      </div>
      <div className="rounded-b-3xl py-8 sm:px-15 w-full text-center sm:text-left">
        © 2026 dobrokot.com
      </div>
    </footer>
  );
};
