import { cn } from "@/lib/utils";

export function Badge({
  tone = "muted",
  className,
  ...props
}: { tone?: "muted" | "accent" | "ok" | "warn" } & React.HTMLAttributes<HTMLSpanElement>) {
  const tones = {
    muted: "bg-canteen-bg text-canteen-muted",
    accent: "bg-canteen-accentSoft text-canteen-accent",
    ok: "bg-canteen-okSoft text-canteen-ok",
    warn: "bg-amber-50 text-canteen-warn",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
