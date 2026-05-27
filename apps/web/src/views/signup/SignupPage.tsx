import { Badge } from "@/shared/ui";
import { SignupForm } from "./ui/SignupForm";

export function SignupPage() {
  return (
    <main className="flex flex-col gap-8 pb-10 sm:pb-15 rounded-t-3xl bg-background pt-5 sm:pt-12 sm:mx-auto sm:max-w-[calc(100%-16px)]">
      <div className="flex items-center flex-col gap-2.5 text-center">
        <Badge>Добро пожаловать</Badge>
        <h1 className="text-4xl sm:text-6xl font-semibold">Регистрация</h1>
        <p className="text-foreground/70 text-sm max-w-md sm:max-w-none">
          Зарегистрируйте себя и своего питомца на нашей платформе
        </p>
      </div>
      <SignupForm />
    </main>
  );
}
