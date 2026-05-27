import Image from "next/image";
import Link from "next/link";
import { Badge, Button } from "@/shared/ui";

export function PaymentSuccessPage() {
  return (
    <main className="flex flex-col gap-8 pb-10 sm:pb-15 rounded-t-3xl bg-background pt-5 sm:pt-12 sm:mx-auto sm:max-w-[calc(100%-16px)] px-1 sm:px-10">
      <div className="flex items-center flex-col gap-2.5 text-center">
        <Badge>Откроем Вам специальный раздел</Badge>
        <h1 className="text-4xl sm:text-6xl font-semibold">Тарифы</h1>
      </div>

      <div className="rounded-3xl bg-white p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 items-center">
        <div className="flex flex-col gap-6 order-2 sm:order-1">
          <div className="flex gap-2">
            <span className="rounded-full border border-stroke px-4 py-1.5 text-sm">
              Донорство
            </span>
            <span className="rounded-full bg-foreground px-4 py-1.5 text-sm text-background">
              Помощь
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
            Успешно оплачено!
          </h2>
          <p className="text-foreground/70 text-sm sm:text-base">
            Отправили контакты доноров уже Вам в личный кабинет! Хотите
            посмотреть?
          </p>
          <Link href="/profile">
            <Button className="w-full">Перейти в Личный кабинет</Button>
          </Link>
        </div>
        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl bg-secondary order-1 sm:order-2">
          <Image
            src="/how_it_works2.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </main>
  );
}
