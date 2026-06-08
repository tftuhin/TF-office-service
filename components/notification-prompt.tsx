"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    const isSupported = typeof Notification !== "undefined";
    setNotificationSupported(isSupported);

    if (isSupported) {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      console.log("Notification permission status:", currentPermission);

      // Show prompt if permission not yet requested
      if (currentPermission === "default") {
        console.log("Showing notification prompt");
        const timer = setTimeout(() => {
          setShow(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (currentPermission === "denied") {
        console.log("Notifications were denied by user");
      } else if (currentPermission === "granted") {
        console.log("Notifications already granted");
      }
    } else {
      console.log("Notifications not supported in this browser");
    }
  }, []);

  const handleEnable = async () => {
    if (typeof Notification === "undefined") {
      alert("Notifications not supported in this browser");
      return;
    }

    try {
      console.log("Requesting notification permission...");
      const permission = await Notification.requestPermission();
      console.log("Permission result:", permission);

      setPermission(permission);

      if (permission === "granted") {
        console.log("Notifications granted, sending test notification");
        // Test notification
        new Notification("Themefisher ✓", {
          body: "Notifications enabled! You'll receive alerts for new orders",
          badge: "🏢",
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%231a2b45' width='192' height='192'/><text x='96' y='130' font-size='100' text-anchor='middle' fill='white'>✓</text></svg>",
          requireInteraction: false,
        });
      } else if (permission === "denied") {
        alert("Notifications blocked. Please enable notifications in browser settings.");
      }

      setShow(false);
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      alert("Error enabling notifications: " + error);
    }
  };

  // Always show if permission is default (not yet requested)
  const shouldShow = notificationSupported && permission === "default";

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
