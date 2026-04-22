import { Button } from "@/shared/ui";
import { Badge } from "@/shared/ui/badge";
import { ArrowDownRight } from "lucide-react";
import Image from "next/image";

export const HeroSectionDesktop = () => {
  return (
    <div className="bg-background max-sm:hidden">
      <section className="bg-linear-to-b from-[#C94322] to-[#C7311B] p-10 rounded-t-3xl flex flex-col h-187.5 text-white w-[calc(100%-16px)] mx-auto relative overflow-hidden">
        <div className="flex flex-col gap-5">
          <p>Следите за нами</p>
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
        <div className="flex mt-50">
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
        <h1 className="leading-22.5 text-8xl font-semibold mt-9 max-w-213">
          На четырёх лапах к здоровью
        </h1>
        <Image src="/cat_desktop.png" alt="" width={592} height={736} className="absolute bottom-0 right-0 z-20"/>
        <Image src="/subtract1.svg" alt="" width={596} height={257} className="absolute -bottom-16 right-28 z-10 -rotate-20"/>
        <Image src="/subtract1.svg" alt="" width={596} height={257} className="absolute bottom-34 -right-36 z-10"/>
        <Image src="/subtract2.svg" alt="" width={477} height={338} className="absolute top-0 right-106 z-10"/>
        <div className="bg-background rounded-t-[40px] absolute bottom-0 left-0 z-40 h-12 w-full"></div>
        <div className="flex absolute right-10 bottom-38 z-30">
          <Button variant="white">Стать донором</Button>
          <Button variant="white" size="icon">
            <ArrowDownRight />
          </Button>
        </div>
      </section>
    </div>
  );
};
