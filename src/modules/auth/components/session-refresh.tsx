"use client";

import { useEffect } from "react";

export type SessionRefreshProps = Readonly<{
  returnTo?: string;
}>;

export function SessionRefresh({
  returnTo = "/account",
}: SessionRefreshProps = {}) {
  useEffect(() => {
    const controller = new AbortController();

    async function refreshSession(): Promise<void> {
      try {
        const response = await fetch("/api/access/session/refresh", {
          method: "POST",
          signal: controller.signal,
        });

        if (response.status === 401) {
          window.location.assign(
            `/access?returnTo=${encodeURIComponent(returnTo)}`,
          );
        }
      } catch {
        return;
      }
    }

    void refreshSession();

    return () => controller.abort();
  }, [returnTo]);

  return null;
}
