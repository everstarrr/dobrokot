import { cn } from "@/app/shared/lib/utils";
import { ArrowDownRight, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const baseMenu = [
  { label: "Проект", href: "/" },
  { label: "Блог", href: "/blog" },
  { label: "Наши результаты", href: "/results" },
  { label: "Карта доноров", href: "/map" },
  { label: "Партнёрство", href: "/partnership" },
];

type MobileMenuProps = {
  isOpen: boolean;
  isHome: boolean;
  findDonorHref: string;
  extraLinks?: { href: string; label: string }[];
  profileHref?: string | null;
  onNavigate?: () => void;
};

export const MobileMenu = ({
  isOpen,
  isHome,
  findDonorHref,
  extraLinks = [],
  profileHref = null,
  onNavigate,
}: MobileMenuProps) => {
  const items = [...baseMenu, ...extraLinks, { label: "Найти донора", href: findDonorHref }];

  return (
    <nav
      aria-hidden={!isOpen}
      className={cn(
        "sm:hidden overflow-hidden border-t transition-all duration-300 ease-out",
        isHome
          ? "border-foreground/10 bg-background text-foreground"
          : "border-white/15 bg-accent-orange text-white",
        isOpen
          ? "pointer-events-auto max-h-[calc(100vh-5rem)] translate-y-0 opacity-100 overflow-y-auto"
          : "pointer-events-none max-h-0 -translate-y-3 opacity-0",
      )}
    >
      {items.map((item) => (
        <Link
          key={`${item.href}-${item.label}`}
          href={item.href}
          onClick={onNavigate}
          className="flex p-4 justify-between items-center text-2xl"
        >
          {item.label}
          <ArrowDownRight size={33} />
        </Link>
      ))}
      {profileHref && (
        <Link
          href={profileHref}
          onClick={onNavigate}
          className="flex p-4 justify-between items-center text-2xl"
        >
          Личный кабинет
          <User size={28} />
        </Link>
      )}
      <div className="flex">
        <Link href="/" onClick={onNavigate} className="p-4">
          <Image src="/dzen.svg" alt="Dzen" width={28} height={28} />
        </Link>
        <Link href="/" onClick={onNavigate} className="p-4">
          <Image src="/vk.svg" alt="VK" width={32} height={20} />
        </Link>
        <Link href="/" onClick={onNavigate} className="p-4">
          <Image src="/max.svg" alt="Max" width={24} height={24} />
        </Link>
      </div>
    </nav>
  );
};
