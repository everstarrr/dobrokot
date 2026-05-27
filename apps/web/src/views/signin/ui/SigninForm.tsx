"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Button, Input } from "@/shared/ui";
import { useAuth } from "@/features/auth/useAuth";

const extractApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return payload?.error || payload?.message || error.message;
  }
  return error instanceof Error ? error.message : "Не удалось войти";
};

export const SigninForm = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shown, setShown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      router.push("/profile");
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const Icon = shown ? EyeOff : Eye;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-3xl bg-white p-5 sm:p-8"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-typography">
        Email
        <Input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-typography">
        Пароль
        <div className="relative">
          <Input
            type={shown ? "text" : "password"}
            placeholder="Минимум 8 символов"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShown((prev) => !prev)}
            aria-label={shown ? "Скрыть пароль" : "Показать пароль"}
            className="absolute inset-y-0 right-3 flex items-center text-muted"
          >
            <Icon size={20} />
          </button>
        </div>
      </label>

      {error && <p className="text-sm text-accent-orange">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Входим…" : "Войти в аккаунт"}
      </Button>

      <p className="text-center text-sm text-typography">
        Нет аккаунта?{" "}
        <Link href="/signup" className="text-accent-orange font-medium">
          Регистрация
        </Link>
      </p>
    </form>
  );
};
