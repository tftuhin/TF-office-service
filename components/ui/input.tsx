import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-canteen-line bg-white px-3 text-sm text-canteen-ink placeholder:text-canteen-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canteen-accent/40",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-canteen-muted">{label}</span>
      {children}
    </label>
  );
}
