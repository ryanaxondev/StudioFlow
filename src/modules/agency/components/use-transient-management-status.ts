"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ManagementStatusTone = "success" | "warning" | "danger";

export type ManagementStatus = Readonly<{
  message: string;
  tone: ManagementStatusTone;
}>;

const DEFAULT_DURATION_MS = 6000;

export function useTransientManagementStatus(durationMs = DEFAULT_DURATION_MS) {
  const [status, setStatus] = useState<ManagementStatus | null>(null);
  const timerRef = useRef<number | null>(null);

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    cancelTimer();
    setStatus(null);
  }, [cancelTimer]);

  const show = useCallback(
    (message: string, tone: ManagementStatusTone) => {
      cancelTimer();
      setStatus({ message, tone });
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setStatus(null);
      }, durationMs);
    },
    [cancelTimer, durationMs],
  );

  useEffect(() => cancelTimer, [cancelTimer]);

  return { status, show, clear } as const;
}
