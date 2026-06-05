"use client";

import { Button } from "@/shared/ui";
import { Badge } from "@/shared/ui/badge";
import { ArrowDownRight } from "lucide-react";
import Image from "next/image";

const scrollToQuestions = () => {
  document
    .getElementById("questions-form")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const HeroSection = () => {
  return (
    <div className="bg-background sm:hidden">
      <section className="bg-linear-to-b from-[#C94322] to-[#C7311B] bg-[url('/mainbg_mobile.png')] bg-bottom bg-no-repeat bg-cover p-5 rounded-3xl flex flex-col items-center h-169 text-white">
        <div className="flex flex-col items-center">
          <div className="flex">
            <Badge variant="transparent" className="text-base px-4 py-2.5">
              Донорство
            </Badge>
            <Badge variant="transparent" className="text-base px-4 py-2.5">
              Помощь
            </Badge>
            <Badge variant="transparent" className="text-base px-4 py-2.5">
              Помощь
            </Badge>
          </div>
          <h1 className="text-center leading-8.25 text-4xl font-semibold mt-7.5">
            На четырёх лапах к здоровью
          </h1>
          <div className="flex flex-col gap-5 items-center">
            <p className="mt-7.5">Следите за нами</p>
            <div className="flex">
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
          </div>
        </div>
        <div className="flex mt-auto">
          <Button variant="white" onClick={scrollToQuestions}>
            Стать донором
          </Button>
          <Button variant="white" size="icon" onClick={scrollToQuestions}>
            <ArrowDownRight />
          </Button>
        </div>
      </section>
    </div>
  );
};
