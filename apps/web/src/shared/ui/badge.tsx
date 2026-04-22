import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/app/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-3xl transition-colors w-fit",
  {
    variants: {
      variant: {
        default: "bg-accent-orange text-white",
        sky: "bg-accent-sky text-foreground",
        transparent: "border border-white bg-white/10 backdrop-blur-md",
        biege: "bg-[#FDF1E3] text-foreground",
      },
      size: {
        sm: "gap-1 px-1.5 py-0.5 text-xs [&>svg]:size-2.25",
        default: "gap-1 px-5 py-1.5 text-sm [&>svg]:size-2.25",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
