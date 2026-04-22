import { Button } from "@/shared/ui";
import {
  HeartHandshake,
  MessageCircleHeart,
  MousePointerClick,
  Zap,
} from "lucide-react";
import Image from "next/image";

export const AboutUsSection = () => {
  return (
    <div className="flex flex-col gap-7.5 sm:gap-15 max-sm:py-7.5 sm:px-10 sm:pb-15 sm:-mt-10">
      <div className="flex flex-col gap-5 items-center px-1">
        <p className="text-muted font-medium">О нас</p>
        <p className="text-xl sm:text-5xl font-semibold leading-7.5 sm:leading-14.75 max-w-261">
          Сервис объединяет{" "}
          <span className="text-muted">
            владельцев животных и ветеринарные клиники для оперативного поиска
            доноров.
          </span>{" "}
          Когда время важно — помощь находится быстрее.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-5 sm:justify-between sm:items-center max-w-8xl mx-auto w-full">
        <div className="overflow-x-auto">
          <div className="flex gap-5 px-1">
            <Image src="/main_img1.png" alt="" width={262} height={200} className="object-cover object-center rounded-2xl"/>
            <Image src="/main_img2.png" alt="" width={262} height={200} className="object-cover object-center rounded-2xl" />
          </div>
        </div>
        <div className="flex justify-between sm:gap-5 px-1 text-sm">
          <div className="flex flex-col gap-2 items-center">
            <Button variant="white" size="icon">
              <HeartHandshake />
            </Button>
            Забота
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Button variant="white" size="icon">
              <MessageCircleHeart />
            </Button>
            Сообщество
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Button variant="white" size="icon">
              <Zap />
            </Button>
            Скорость
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Button variant="white" size="icon">
              <MousePointerClick />
            </Button>
            Платформа
          </div>
        </div>
      </div>
    </div>
  );
};
