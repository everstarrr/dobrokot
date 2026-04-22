"use client";

import { cn } from "@/app/shared/lib/utils";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { Button } from "../ui";

const navLinks = [
  { href: "/", label: "Проект" },
  { href: "/blog", label: "Блог" },
  { href: "/results", label: "Мои результаты" },
  { href: "/map", label: "Карта доноров" },
  { href: "/partnership", label: "Партнерство" },
];

export const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 z-9100 w-full">
      <header
        className={cn(
          "h-20 sm:h-26 w-full flex items-center justify-between pl-1 pr-4 sm:px-10 bg-background",
          !isHome && "bg-accent-orange text-white",
        )}
      >
        <Link href="/">
          <Image
            src={isHome ? "/logo.svg" : "/logo_white.svg"}
            alt="Доброкот"
            width={101}
            height={58}
          />
        </Link>

        <nav className="flex gap-4 max-sm:hidden">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 p-4"
            >
              {pathname === item.href && (
                <div
                  className={cn(
                    "rounded-full size-2.5 min-w-2.5",
                    isHome ? "bg-foreground" : "bg-white",
                  )}
                />
              )}
              {item.label}
            </Link>
          ))}
        </nav>

        <Button
          className="max-sm:hidden"
          variant={isHome ? "default" : "outlineWhite"}
        >
          Найти донора
        </Button>

        <button
          type="button"
          className="sm:hidden inline-flex size-12 items-center justify-center"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div id="mobile-menu">
        <MobileMenu
          isOpen={isMobileMenuOpen}
          isHome={isHome}
          onNavigate={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </div>
  );
};
