"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Dialog as RadixDialog } from "radix-ui";
import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  title,
  description,
  children,
  className,
  showClose = true,
}: Readonly<{
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  showClose?: boolean;
}>) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="ui-dialog-overlay" />
      <RadixDialog.Content className={cn("ui-dialog-content", className)}>
        <RadixDialog.Title className="ui-dialog-title">
          {title}
        </RadixDialog.Title>
        {description ? (
          <RadixDialog.Description className="ui-dialog-description">
            {description}
          </RadixDialog.Description>
        ) : null}
        {children}
        {showClose ? (
          <RadixDialog.Close
            className="ui-dialog-close"
            aria-label="Close dialog"
          >
            <Cross2Icon width="18" height="18" />
          </RadixDialog.Close>
        ) : null}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
