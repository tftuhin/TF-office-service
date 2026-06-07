import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canteen-accent/40",
  {
    variants: {
      variant: {
        primary: "bg-canteen-accent text-white hover:bg-canteen-accent/90 shadow-sm",
        ok: "bg-canteen-ok text-white hover:bg-canteen-ok/90 shadow-sm",
        outline: "border border-canteen-line bg-white text-canteen-ink hover:bg-canteen-bg",
        ghost: "text-canteen-muted hover:bg-canteen-bg hover:text-canteen-ink",
        danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
      },
      size: { sm: "h-8 px-3", md: "h-10 px-4", lg: "h-12 px-6 text-base" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(button({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
