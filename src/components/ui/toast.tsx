"use client";

import { Toast as RadixToast } from "radix-ui";
import type { ReactNode } from "react";

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <RadixToast.Provider swipeDirection="right">
      {children}
      <RadixToast.Viewport className="ui-toast-viewport" />
    </RadixToast.Provider>
  );
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
}>) {
  return (
    <RadixToast.Root
      className="ui-toast"
      open={open}
      onOpenChange={onOpenChange}
    >
      <RadixToast.Title>{title}</RadixToast.Title>
      {description ? (
        <RadixToast.Description>{description}</RadixToast.Description>
      ) : null}
    </RadixToast.Root>
  );
}

export function LiveAnnouncement({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {children}
    </p>
  );
}
