"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if notifications are supported and not yet requested
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      // Show prompt after 2 seconds
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    if (typeof Notification !== "undefined") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("Notifications Enabled! 🔔", {
          body: "You'll now receive alerts for new orders",
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%231a2b45' width='192' height='192'/><text x='96' y='130' font-size='100' text-anchor='middle' fill='white'>📦</text></svg>",
        });
      }
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 mx-4 md:right-4 md:left-auto md:w-80">
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-start gap-2">
            <Bell size={20} className="mt-0.5 text-primary-700 flex-shrink-0" />
            <div>
              <p className="font-medium text-canteen-ink">Enable Notifications?</p>
              <p className="text-sm text-canteen-muted mt-1">Get alerts for new orders even when the app is closed</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEnable} className="flex-1 bg-primary-700 hover:bg-primary-800">
              Enable
            </Button>
            <Button onClick={() => setShow(false)} variant="outline" className="flex-1">
              Later
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
