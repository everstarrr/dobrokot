"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Badge, Button, Checkbox, Input } from "@/shared/ui";
import { useAuth } from "@/features/auth/useAuth";

type FormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
  agree: boolean;
};

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  passwordConfirm: "",
  agree: true,
};

const fields: Array<{
  label: string;
  name: Exclude<keyof FormValues, "agree" | "password" | "passwordConfirm">;
  placeholder: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}> = [
  { label: "Имя", name: "firstName", placeholder: "Имя" },
  { label: "Фамилия", name: "lastName", placeholder: "Фамилия" },
  {
    label: "Телефон",
    name: "phone",
    placeholder: "+70000000000",
    type: "tel",
    inputMode: "tel",
  },
  { label: "Email", name: "email", placeholder: "name@example.com", type: "email" },
];

type PasswordFieldProps = {
  label: string;
  name: Extract<keyof FormValues, "password" | "passwordConfirm">;
  values: FormValues;
  onChange: (name: keyof FormValues, value: string) => void;
};

const PasswordField = ({ label, name, values, onChange }: PasswordFieldProps) => {
  const [shown, setShown] = useState(false);
  const Icon = shown ? EyeOff : Eye;
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-typography">
      {label}
      <div className="relative">
        <Input
          type={shown ? "text" : "password"}
          placeholder="Минимум 8 символов"
          value={values[name]}
          onChange={(event) => onChange(name, event.target.value)}
          className="pr-12"
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
  );
};

const extractApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return payload?.error || payload?.message || error.message;
  }
  return error instanceof Error ? error.message : "Не удалось зарегистрироваться";
};

export const SignupForm = () => {
  const router = useRouter();
  const { signUp } = useAuth();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (name: keyof FormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (values.password !== values.passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signUp({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`.trim(),
        phone: values.phone || undefined,
      });
      router.push("/profile");
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-3xl bg-white p-5 sm:p-8"
    >
      <Badge className="mx-auto">Информация о хозяине питомца</Badge>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">
        {fields.map((field) => (
          <label
            key={field.name}
            className="flex flex-col gap-1.5 text-sm font-medium text-typography"
          >
            {field.label}
            <Input
              type={field.type ?? "text"}
              inputMode={field.inputMode}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(event) => set(field.name, event.target.value)}
              required
            />
          </label>
        ))}

        <PasswordField label="Пароль" name="password" values={values} onChange={set} />
        <PasswordField
          label="Повторите пароль"
          name="passwordConfirm"
          values={values}
          onChange={set}
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm text-typography">
        <Checkbox
          checked={values.agree}
          onCheckedChange={(checked) => set("agree", checked === true)}
        />
        <span>
          Я согласен с{" "}
          <a href="#" className="text-accent-orange">
            Условиями предоставления доступа
          </a>
        </span>
      </label>

      {error && <p className="text-sm text-accent-orange">{error}</p>}

      <Button type="submit" className="w-full" disabled={!values.agree || submitting}>
        {submitting ? "Регистрируем…" : "Далее"}
      </Button>

      <p className="text-center text-sm text-typography">
        Есть аккаунт?{" "}
        <Link href="/signin" className="text-accent-orange font-medium">
          Вход
        </Link>
      </p>
    </form>
  );
};
