import { cn } from "@/lib/utils";
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-canteen-line/60", className)} />;
}
