"use client";

import { cn } from "@/app/shared/lib/utils";
import { Menu, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { Button } from "../ui";
import { useAuth, UserRole } from "@/features/auth/useAuth";

const baseLinks = [
  { href: "/", label: "Проект" },
  { href: "/blog", label: "Блог" },
  { href: "/results", label: "Наши результаты" },
  { href: "/map", label: "Карта доноров" },
  { href: "/partnership", label: "Партнерство" },
];

export const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, role, plan } = useAuth();

  const isHome = pathname === "/";
  const profileHref = role === UserRole.CLINIC ? "/clinic" : "/profile";
  const hasPlan = isAuthenticated && plan !== null;

  const findDonorHref = !isAuthenticated
    ? "/signup"
    : hasPlan
      ? "/blood-search"
      : "/plans";

  const orangeBg = !isHome;

  const navLinks = hasPlan
    ? [...baseLinks, { href: "/blood-search", label: "Поиск крови" }]
    : baseLinks;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 z-9100 w-full">
      <header
        className={cn(
          "h-20 sm:h-26 w-full",
          orangeBg ? "bg-accent-orange text-white" : "bg-background",
        )}
      >
        <div className="mx-auto h-full max-w-8xl flex items-center justify-between pl-1 pr-4 sm:px-10">
          <Link href="/">
            <Image
              src={orangeBg ? "/logo_white.svg" : "/logo.svg"}
              alt="Доброкот"
              width={101}
              height={58}
            />
          </Link>

          <nav className="flex gap-1 max-sm:hidden">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 p-4 transition-opacity",
                  pathname === item.href ? "opacity-100" : "opacity-70 hover:opacity-100",
                )}
              >
                {pathname === item.href && (
                  <div
                    className={cn(
                      "rounded-full size-2.5 min-w-2.5",
                      orangeBg ? "bg-white" : "bg-foreground",
                    )}
                  />
                )}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 max-sm:hidden">
            {isAuthenticated && (
              <Link
                href={profileHref}
                aria-label="Личный кабинет"
                className={cn(
                  "inline-flex size-13 items-center justify-center rounded-full transition-colors",
                  orangeBg
                    ? "bg-foreground border border-white text-white hover:bg-white hover:text-foreground"
                    : "border border-foreground text-foreground hover:bg-foreground hover:text-background",
                )}
              >
                <User size={20} />
              </Link>
            )}
            <Link href={findDonorHref}>
              {orangeBg && isAuthenticated ? (
                <Button className="bg-foreground border border-white text-white">
                  Найти донора
                </Button>
              ) : (
                <Button variant={orangeBg ? "outlineWhite" : "default"}>
                  Найти донора
                </Button>
              )}
            </Link>
          </div>

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
        </div>
      </header>

      <div id="mobile-menu">
        <MobileMenu
          isOpen={isMobileMenuOpen}
          isHome={!orangeBg}
          findDonorHref={findDonorHref}
          extraLinks={hasPlan ? [{ href: "/blood-search", label: "Поиск крови" }] : []}
          profileHref={isAuthenticated ? profileHref : null}
          onNavigate={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </div>
  );
};
