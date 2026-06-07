"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Toast = { id: number; title: string; body: string; tone: "new" | "reminder" };

const ToastCtx = createContext<(t: Omit<Toast, "id">) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

const REMINDER_MS = 5 * 60 * 1000; // 5-minute pending reminder

export function NotificationProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 8000);
  }, []);

  // --- Short alert tone via Web Audio (no audio file needed) -----------------
  const beep = useCallback(() => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1175, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      /* autoplay may be blocked until the first user interaction */
    }
  }, []);

  const notify = useCallback(
    (title: string, body: string, tone: Toast["tone"]) => {
      pushToast({ title, body, tone });
      beep();
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(title, { body, tag: tone === "reminder" ? "pending-reminder" : undefined });
      }
    },
    [pushToast, beep]
  );

  useEffect(() => {
    if (!enabled) return;

    // Ask for permission once.
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const supabase = createClient();

    // 1) New-order realtime alert -------------------------------------------
    const channel = supabase
      .channel("orders-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: "status=eq.pending" },
        () => notify("New Order Placed!", "A new order just landed in the queue.", "new")
      )
      .subscribe();

    // 2) Every-5-minutes pending reminder -----------------------------------
    const checkPending = async () => {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if ((count ?? 0) > 0) {
        notify(
          "You still have pending orders waiting!",
          `${count} order${count === 1 ? "" : "s"} still need attention.`,
          "reminder"
        );
      }
    };
    const interval = setInterval(checkPending, REMINDER_MS);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [enabled, notify]);

  return (
    <ToastCtx.Provider value={pushToast}>
      {children}
      {/* Visual alert region */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border bg-white p-4 shadow-card ${
              t.tone === "new" ? "border-canteen-accent" : "border-canteen-warn"
            }`}
          >
            <p className="font-display text-sm text-canteen-ink">{t.title}</p>
            <p className="mt-0.5 text-sm text-canteen-muted">{t.body}</p>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
