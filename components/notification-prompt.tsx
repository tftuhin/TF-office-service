"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { LocalNotifications } from "@capacitor/local-notifications";

export function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "granted" | "denied" | "prompt" | null>(null);

  useEffect(() => {
    const initNotifications = async () => {
      // Check if running in Capacitor (native mobile app)
      const inCapacitor = typeof (window as any).capacitor !== "undefined" || typeof (window as any).Capacitor !== "undefined";
      setIsCapacitor(inCapacitor);
      console.log("Is Capacitor:", inCapacitor, {
        capacitor: typeof (window as any).capacitor,
        Capacitor: typeof (window as any).Capacitor,
      });

      if (inCapacitor) {
        try {
          // Check Capacitor permission status
          const status = await LocalNotifications.checkPermissions();
          console.log("Capacitor notification permission status:", status);
          setNotificationSupported(true);

          // Prompt is shown if permission is "prompt"
          if (status.display === "prompt" || status.display === "default") {
            console.log("Showing Capacitor notification prompt");
            setPermission("prompt");
            setShow(true);
          } else if (status.display === "granted") {
            console.log("Capacitor notifications already granted");
            setPermission("granted");
          } else if (status.display === "denied") {
            console.log("Capacitor notifications were denied");
            setPermission("denied");
          }
        } catch (error) {
          console.error("Error checking Capacitor permissions:", error);
        }
      } else {
        // Web Notification API
        const isSupported = typeof Notification !== "undefined";
        setNotificationSupported(isSupported);

        if (isSupported) {
          const currentPermission = Notification.permission;
          setPermission(currentPermission as any);
          console.log("Web notification permission status:", currentPermission);

          if (currentPermission === "default") {
            console.log("Showing web notification prompt");
            setShow(true);
          }
        }
      }
    };

    initNotifications();
  }, []);

  const handleEnable = async () => {
    try {
      if (isCapacitor) {
        console.log("Requesting Capacitor notification permission...");
        const status = await LocalNotifications.requestPermissions();
        console.log("Capacitor permission result:", status);

        if (status.display === "granted") {
          setPermission("granted");
          console.log("Capacitor notifications granted, sending test notification");

          // Test notification
          await LocalNotifications.schedule({
            notifications: [
              {
                title: "Themefisher ✓",
                body: "Notifications enabled! You'll receive alerts for new orders",
                id: Math.floor(Date.now() / 1000),
                schedule: { at: new Date(Date.now() + 100) },
              },
            ],
          });
        } else {
          setPermission("denied");
          alert("Notifications denied. Please enable in your device settings.");
        }
      } else {
        // Web Notification API
        if (typeof Notification === "undefined") {
          alert("Notifications not supported in this browser");
          return;
        }

        console.log("Requesting web notification permission...");
        const perm = await Notification.requestPermission();
        console.log("Web permission result:", perm);

        setPermission(perm as any);

        if (perm === "granted") {
          console.log("Notifications granted, sending test notification");
          new Notification("Themefisher ✓", {
            body: "Notifications enabled! You'll receive alerts for new orders",
            badge: "🏢",
            icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%231a2b45' width='192' height='192'/><text x='96' y='130' font-size='100' text-anchor='middle' fill='white'>✓</text></svg>",
            requireInteraction: false,
          });
        } else if (perm === "denied") {
          alert("Notifications blocked. Please enable notifications in browser settings.");
        }
      }

      setShow(false);
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      alert("Error enabling notifications: " + error);
    }
  };

  const shouldShow = notificationSupported && (permission === "default" || permission === "prompt");

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 mx-4 md:right-4 md:left-auto md:w-80 animate-bounce">
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-start gap-3">
            <Bell size={24} className="mt-0.5 text-primary-700 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="font-medium text-canteen-ink">Get Order Alerts 🔔</p>
              <p className="text-sm text-canteen-muted mt-1">Enable notifications to get notified when orders arrive, even if app is closed</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEnable} className="flex-1 bg-primary-700 hover:bg-primary-800 text-white">
              Enable Notifications
            </Button>
            <Button onClick={() => setShow(false)} variant="outline" className="flex-1">
              Skip
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
