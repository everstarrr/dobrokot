import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

import { BodyBackgroundController } from "@/shared/layout/BodyBackgroundController";
import { Header } from "@/shared/layout/Header";
import { QuestionsForm } from "@/shared/layout/QuestionsForm";
import { Providers } from "./providers";
import { Footer } from "@/shared/layout/Footer";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "ДоБроКот — Платформа поиска доноров крови для животных",
  description:
    "Сервис для оперативного поиска доноров крови среди домашних животных. Помогаем спасать жизни питомцев.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`min-h-screen bg-background pt-20 sm:pt-26 font-sans antialiased ${manrope.className}`}
      >
        <Providers>
          <BodyBackgroundController />
          <Header />
          {children}
          <QuestionsForm />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
