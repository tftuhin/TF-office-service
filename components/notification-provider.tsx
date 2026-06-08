"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { showCapacitorNotification, initializeCapacitorNotifications } from "@/lib/capacitor-notifications";

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

  // --- EXTREMELY LOUD alert tone via Web Audio ------------------
  const beep = useCallback(() => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();

      // Create multiple oscillators for richer, louder sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const masterGain = ctx.createGain();

      // Connect oscillators to gain
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Set maximum volume (1.0 is max for Web Audio)
      masterGain.gain.setValueAtTime(1.0, ctx.currentTime);

      const now = ctx.currentTime;
      const alertDuration = 5; // 5 second alert

      // Two different frequencies for richer alarm sound
      osc1.type = "square";
      osc2.type = "triangle";

      // Play 4 loud beeps with high and low tones
      for (let i = 0; i < 4; i++) {
        const offset = i * 1.2;
        if (offset >= alertDuration) break;

        // Alternate between high and low tones
        const highFreq = i % 2 === 0 ? 1000 : 800;
        const lowFreq = i % 2 === 0 ? 600 : 500;

        // High frequency beep
        osc1.frequency.setValueAtTime(highFreq, now + offset);
        osc2.frequency.setValueAtTime(lowFreq, now + offset);
        gain.gain.setValueAtTime(0.9, now + offset);
        gain.gain.linearRampToValueAtTime(0.9, now + offset + 0.4); // Hold at max
        gain.gain.linearRampToValueAtTime(0, now + offset + 0.5); // Quick fade

        // Add subtle fade for next beep
        gain.gain.setValueAtTime(0.05, now + offset + 0.5);
      }

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + alertDuration);
      osc2.stop(now + alertDuration);

      // EXTREMELY strong vibration pattern (if device supports it)
      if (navigator.vibrate) {
        // Long vibration bursts: 500ms on, 200ms off (repeat 5 times)
        navigator.vibrate([500, 200, 500, 200, 500, 200, 500, 200, 500]);
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

      // Try Capacitor notifications first (works even when app is in background)
      showCapacitorNotification(title, body, {
        largeBody: body,
        vibrate: true,
        sound: tone === "new" ? "beep" : undefined,
      }).catch(() => {
        console.log("Capacitor not available, using browser notifications");
      });

      // Fallback to browser notification (works when app is open)
      if (typeof Notification !== "undefined") {
        if (Notification.permission === "granted") {
          try {
            const notifOptions: NotificationOptions = {
              body,
              tag: tone === "new" ? "new-order" : "pending-reminder",
              requireInteraction: true, // Forces user to dismiss
              badge: "🏢",
              icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%231a2b45' width='192' height='192'/><text x='96' y='130' font-size='100' text-anchor='middle' fill='white'>📦</text></svg>",
              silent: false, // Ensure sound plays
            };

            const notification = new Notification(title, notifOptions);

            // Click handler
            notification.onclick = () => {
              window.focus();
              notification.close();
            };

            // Play extremely loud alert for new orders
            if (tone === "new") {
              // Immediate first alert
              beep();
              // Follow-up alerts after short delays for extreme urgency
              setTimeout(() => beep(), 800);
              setTimeout(() => beep(), 1600);
            }
          } catch (e) {
            console.error("Notification error:", e);
          }
        }
      }

      // Request permission if not yet decided
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "default"
      ) {
        Notification.requestPermission().catch(() => {
          console.log("User denied notification permission");
        });
      }
    },
    [pushToast, beep]
  );

  useEffect(() => {
    if (!enabled) return;

    // Initialize Capacitor notifications (for native mobile app)
    initializeCapacitorNotifications().catch(() => {
      console.log("Capacitor not available");
    });

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
