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

  // --- Loud alert tone via Web Audio (persistent, repeating) ------------------
  const beep = useCallback(() => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";

      const now = ctx.currentTime;
      const duration = 3; // 3 second alert total

      // Repeating loud beep pattern (plays 3 times)
      for (let i = 0; i < 3; i++) {
        const offset = i * 1;
        // High beep (loud)
        osc.frequency.setValueAtTime(1200, now + offset);
        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(0.8, now + offset + 0.05); // Ramp up to max volume
        gain.gain.linearRampToValueAtTime(0.8, now + offset + 0.25); // Hold at loud volume
        gain.gain.linearRampToValueAtTime(0, now + offset + 0.35); // Fade out
      }

      osc.start();
      osc.stop(now + duration);

      // Vibration pattern (if device supports it)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]); // Vibrate 5 times
      }
    } catch {
      /* autoplay may be blocked until the first user interaction */
    }
  }, []);

  const notify = useCallback(
    (title: string, body: string, tone: Toast["tone"]) => {
      pushToast({ title, body, tone });
      // New orders get loud continuous alert
      beep();

      // Browser notification - persist on screen and in notification bar
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          const notif = new Notification(title, {
            body,
            tag: tone === "new" ? "new-order" : "pending-reminder",
            requireInteraction: true, // Keep notification visible until user interacts
            badge: "🏢",
            icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%231a2b45' width='192' height='192'/><text x='96' y='130' font-size='100' text-anchor='middle' fill='white'>📦</text></svg>",
            vibrate: [200, 100, 200, 100, 200], // Vibrate pattern for phones
            actions: tone === "new" ? [
              { action: 'open', title: 'Open' },
              { action: 'dismiss', title: 'Dismiss' }
            ] : undefined,
          });
          // Play sound again when notification appears
          setTimeout(() => {
            if (tone === "new") beep();
          }, 500);
        } catch (e) {
          console.error("Notification API error:", e);
        }
      }
    },
    [pushToast, beep]
  );

  useEffect(() => {
    if (!enabled) return;

    // Request notification permissions on app load
    if (typeof Notification !== "undefined") {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {
          /* permission denied */
        });
      }
    }

    // Request service worker notifications permission
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        if (!registration.pushManager) return;
        registration.pushManager.getSubscription().then((subscription) => {
          if (!subscription) {
            // Subscribe to push notifications
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_KEY;
            if (vapidPublicKey) {
              registration.pushManager
                .subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: vapidPublicKey,
                })
                .catch(() => {
                  /* subscription failed */
                });
            }
          }
        });
      });
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
