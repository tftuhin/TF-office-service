"use client";

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("Service Worker registered:", registration);

          // Listen for messages from Service Worker
          navigator.serviceWorker.addEventListener("message", (event) => {
            console.log("Message from Service Worker:", event.data);
          });
        })
        .catch((err) => console.error("Service Worker registration failed:", err));
    }
  }, []);

  return null;
}
