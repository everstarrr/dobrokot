"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const BodyBackgroundController = () => {
  const pathname = usePathname();

  useEffect(() => {
    const isHomePage = pathname === "/";

    document.body.classList.toggle("bg-background", isHomePage);
    document.body.classList.toggle("bg-accent-orange", !isHomePage);

    return () => {
      document.body.classList.remove("bg-background", "bg-accent-orange");
    };
  }, [pathname]);

  return null;
};
