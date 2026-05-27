"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Modal } from "@/shared/ui";

type Variant = "found" | "not-found";

type Props = {
  open: boolean;
  onClose: () => void;
  variant: Variant;
  matchCount?: number;
};

export const BloodResultModal = ({ open, onClose, variant, matchCount = 12 }: Props) => {
  const isFound = variant === "found";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-7">
        <div className="flex flex-1 flex-col gap-5 sm:py-2">
          <div className="flex gap-2.5">
            <span className="rounded-full border border-foreground/30 px-4 py-1.5 text-sm">
              Донорство
            </span>
            <span className="rounded-full bg-foreground px-4 py-1.5 text-sm text-background">
              Помощь
            </span>
          </div>
          {isFound ? (
            <>
              <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
                Нашли для Вас {matchCount} клиник с донорами!
              </h2>
              <p className="text-foreground/70 text-sm sm:text-base">
                Готовы поделиться с Вами контактами прямо сейчас!
              </p>
              <Link href="/blood-search" className="mt-auto">
                <Button className="w-full" onClick={onClose}>
                  Посмотреть клиники
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
                К сожалению, сейчас в клиниках нет крови нужной Вам группы
              </h2>
              <p className="text-foreground/70 text-sm sm:text-base">:(</p>
              <Button className="mt-auto w-full" onClick={onClose}>
                Попробовать найти другую группу крови
              </Button>
            </>
          )}
        </div>
        <div className="flex flex-1 gap-3 max-sm:order-first">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-secondary">
            <Image
              src={isFound ? "/main_img1.png" : "/main_img2.png"}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {isFound && (
            <div className="relative hidden aspect-[3/4] w-32 self-end overflow-hidden rounded-2xl bg-secondary sm:block">
              <Image
                src="/main_img2.png"
                alt=""
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
