"use client";

import { useEffect } from "react";
import { initBackgroundNotifications, setupNotificationActions, stopBackgroundNotifications } from "@/lib/background-notifications";

export function BackgroundNotificationClient() {
  useEffect(() => {
    // Initialize background notifications for mobile
    initBackgroundNotifications();
    setupNotificationActions();

    return () => {
      stopBackgroundNotifications();
    };
  }, []);

  return null;
}
