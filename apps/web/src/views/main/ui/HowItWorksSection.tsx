"use client";

import {
  Button,
  ScrollArea,
  ScrollBar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const steps = [
  {
    value: "registration",
    label: "Регистрация",
    title: "Зарегистрируйтесь и добавьте питомца",
    description:
      "Укажите информацию о вашем питомце. Добавьте имя, карту здоровья, контактные данные и информацию о хозяине.",
    img: "/how_it_works1.png",
  },
  {
    value: "parameters",
    label: "Параметры",
    title: "Укажите важные параметры",
    description:
      "Отметьте желаемую область поиска ветеринарных клиник. Пропишите важные для вас окна и в графе доступа выберите!",
    img: "/how_it_works2.png",
  },
  {
    value: "list",
    label: "Список",
    title: "Подберите только лучшее",
    description:
      "Выберите из списка нужную ветеринарную клинику и переходите к оформлению записи.",
    img: "/how_it_works3.png",
  },
];

export const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(steps[0].value);

  const activeIndex = Math.max(
    steps.findIndex((step) => step.value === activeStep),
    0,
  );
  const nextIndex = (activeIndex + 1) % steps.length;

  const handleArrowClick = (direction: "prev" | "next") => {
    const delta = direction === "next" ? 1 : -1;
    const nextIndex = (activeIndex + delta + steps.length) % steps.length;
    setActiveStep(steps[nextIndex].value);
  };

  return (
    <section className="py-5 sm:py-12 sm:px-10 bg-white flex flex-col sm:flex-row sm:justify-between gap-10 max-w-8xl mx-auto rounded-3xl sm:rounded-[40px] w-full">
      <div className="flex flex-col gap-5 items-center sm:items-start">
        <div className="flex flex-col gap-2.5 items-center sm:items-start w-full sm:w-auto">
          <p className="text-muted font-medium sm:hidden">Как это работает</p>
          <Tabs
            value={activeStep}
            onValueChange={setActiveStep}
            className="w-full"
          >
            <div className="flex justify-between items-center">
              <TabsList className="w-full sm:w-auto">
                {steps.map((step) => (
                  <TabsTrigger key={step.value} value={step.value}>
                    {step.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <p className="text-muted font-medium hidden sm:inline">
                Как это работает
              </p>
            </div>

            {steps.map((step) => (
              <TabsContent
                key={step.value}
                value={step.value}
                className="flex flex-col gap-4 px-1 sm:mt-25 sm:max-w-136"
              >
                <p className="font-semibold text-[32px] sm:text-[45px] leading-9 sm:leading-12.5">
                  {step.title}
                </p>
                <p className="font-medium text-muted sm:text-2xl">
                  {step.description}
                </p>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <div className="flex flex-col gap-5 items-center overflow-hidden sm:hidden">
        <ScrollArea className="w-full">
          <div className="flex gap-5 px-1">
            {steps.map((step) => (
              <Image
                key={step.value}
                src={step.img}
                alt={step.title}
                width={221}
                height={200}
                className="rounded-2xl"
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="iconLg"
            onClick={() => handleArrowClick("prev")}
            aria-label="Предыдущий шаг"
          >
            <ArrowLeft />
          </Button>
          <Button
            variant="outline"
            size="iconLg"
            onClick={() => handleArrowClick("next")}
            aria-label="Следующий шаг"
          >
            <ArrowRight />
          </Button>
        </div>
      </div>

      <div className="items-end gap-5 hidden sm:flex">
        <div className="relative h-117 w-107.25 overflow-hidden rounded-2xl">
          {steps.map((step, index) => (
            <Image
              key={step.value}
              src={step.img}
              alt={step.title}
              fill
              sizes="429px"
              className={`absolute inset-0 rounded-2xl object-cover transition-all duration-500 ease-out motion-reduce:transition-none ${
                index === activeIndex
                  ? "translate-x-0 scale-100 opacity-100"
                  : "translate-x-6 scale-[0.98] opacity-0"
              }`}
            />
          ))}
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="iconLg"
              onClick={() => handleArrowClick("prev")}
              aria-label="Предыдущий шаг"
            >
              <ArrowLeft />
            </Button>
            <Button
              variant="outline"
              size="iconLg"
              onClick={() => handleArrowClick("next")}
              aria-label="Следующий шаг"
            >
              <ArrowRight />
            </Button>
          </div>
          <div className="relative h-50 w-55.25 overflow-hidden rounded-2xl">
            {steps.map((step, index) => (
              <Image
                key={`${step.value}-preview`}
                src={step.img}
                alt={step.title}
                fill
                sizes="221px"
                className={`absolute inset-0 rounded-2xl object-cover transition-all duration-500 ease-out motion-reduce:transition-none ${
                  index === nextIndex
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-4 scale-[0.98] opacity-0"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
