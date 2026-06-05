"use client";

import { usePathname } from "next/navigation";
import { Button, Checkbox, Input } from "../ui";

const ALLOWED_PATHS = new Set(["/", "/blog", "/results", "/map", "/partnership"]);

export const QuestionsForm = () => {
  const pathname = usePathname();
  if (!ALLOWED_PATHS.has(pathname)) {
    return null;
  }

  return (
    <section className="py-10 flex flex-col items-center gap-7.5 bg-background sm:max-w-[calc(100%-16px)] sm:mx-auto">
      <div className="flex flex-col gap-2.5 text-center">
        <h2 className="text-4xl font-semibold text-typography">
          Остались вопросы?
        </h2>
        <p className="text-typography text-sm max-w-166">
          Если у вас остались вопросы, вы можете написать нам в чат на сайте,
          отправить электронное письмо на info@dobrokot.com или заказать
          обратный звонок
        </p>
      </div>
      <form className="rounded-3xl bg-white px-1 pb-1 pt-5 sm:p-7.5 flex flex-col gap-4 w-full sm:w-162">
        <div className="flex flex-col gap-4">
          <Input variant="form" size="form" placeholder="Имя" />
          <Input
            variant="form"
            size="form"
            placeholder="Телефон"
            inputMode="decimal"
            type="tel"
          />
          <div className="flex items-center gap-2.5">
            <Checkbox />{" "}
            <p className="text-sm">
              Нажимая на кнопку, я принимаю{" "}
              <span className="text-accent-orange">условия соглашения</span>
            </p>
          </div>
        </div>
        <Button>Жду звонка</Button>
      </form>
    </section>
  );
};
