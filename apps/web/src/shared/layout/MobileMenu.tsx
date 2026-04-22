import { cn } from "@/app/shared/lib/utils";
import { ArrowDownRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const menu = [
  {
    label: "Проект",
    href: "/",
  },
  {
    label: "Блог",
    href: "/blog",
  },
  {
    label: "Наши результаты",
    href: "/results",
  },
  {
    label: "Карта доноров",
    href: "/map",
  },
  {
    label: "Партнёрство",
    href: "/",
  },
  {
    label: "Найти донора",
    href: "/",
  },
];

type MobileMenuProps = {
  isOpen: boolean;
  isHome: boolean;
  onNavigate?: () => void;
};

export const MobileMenu = ({
  isOpen,
  isHome,
  onNavigate,
}: MobileMenuProps) => {
  return (
    <nav
      aria-hidden={!isOpen}
      className={cn(
        "sm:hidden overflow-hidden border-t transition-all duration-300 ease-out",
        isHome
          ? "border-foreground/10 bg-background text-foreground"
          : "border-white/15 bg-accent-orange text-white",
        isOpen
          ? "pointer-events-auto max-h-[calc(100vh-5rem)] translate-y-0 opacity-100"
          : "pointer-events-none max-h-0 -translate-y-3 opacity-0",
      )}
    >
      {menu.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          onClick={onNavigate}
          className="flex p-4 justify-between items-center text-2xl"
        >
          {item.label}
          <ArrowDownRight size={33} />
        </Link>
      ))}
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
