import { Badge } from "@/shared/ui";

export function SignupPage() {
  return (
    <main className="flex flex-col gap-8 pb-5 sm:pb-15 rounded-t-3xl bg-background pt-5 sm:mx-auto sm:max-w-[calc(100%-16px)]">
      <div className="flex items-center flex-col gap-2.5 text-center">
        <div className="flex flex-col items-center">
          <Badge>Добро пожаловать</Badge>
          <h1 className="text-4xl font-semibold">Регистрация</h1>
        </div>
        <p className="text-foreground/70 text-sm">
          Зарегистрируйте себя и своего питомца на нашей платформе
        </p>
      </div>
    </main>
  );
}
