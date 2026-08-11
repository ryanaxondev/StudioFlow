"use client";

import { useEffect } from "react";

export function SessionRefresh() {
  useEffect(() => {
    const controller = new AbortController();

    async function refreshSession(): Promise<void> {
      try {
        const response = await fetch("/api/access/session/refresh", {
          method: "POST",
          signal: controller.signal,
        });

        if (response.status === 401) {
          window.location.assign("/access?returnTo=/account");
        }
      } catch {
        return;
      }
    }

    void refreshSession();

    return () => controller.abort();
  }, []);

  return null;
}
