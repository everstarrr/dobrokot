import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/app/shared/lib/utils";

const inputVariants = cva(
  "flex w-full text-base transition-colors outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-xl border border-stroke bg-white text-foreground placeholder:text-typography-inactive",
        form:
          "border-b border-stroke bg-transparent placeholder:text-typography-inactive",
      },
      size: {
        default: "h-12 p-3",
        form: "h-11.5 p-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  htmlSize?: React.InputHTMLAttributes<HTMLInputElement>["size"];
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, htmlSize, ...props }, ref) => {
    return (
      <input
        type={type}
        size={htmlSize}
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
