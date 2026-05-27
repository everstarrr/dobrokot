"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/app/shared/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
};

export const Modal = ({ open, onClose, className, children }: ModalProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-[9200] flex items-center justify-center bg-foreground/40 px-4 py-6 backdrop-blur-sm overflow-y-auto"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "relative w-full max-w-[820px] rounded-3xl bg-background p-5 sm:p-7",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full border border-foreground/20 bg-white text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
};
