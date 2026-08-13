"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Dialog as RadixDialog } from "radix-ui";
import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

export const Sheet = RadixDialog.Root;
export const SheetTrigger = RadixDialog.Trigger;
export const SheetClose = RadixDialog.Close;

export function SheetContent({
  title,
  description,
  side = "left",
  children,
  className,
}: Readonly<{
  title: string;
  description?: string;
  side?: "left" | "right";
  children: ReactNode;
  className?: string;
}>) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="ui-dialog-overlay" />
      <RadixDialog.Content
        className={cn("ui-sheet-content", className)}
        data-side={side}
      >
        <RadixDialog.Title className="ui-dialog-title">
          {title}
        </RadixDialog.Title>
        {description ? (
          <RadixDialog.Description className="ui-dialog-description">
            {description}
          </RadixDialog.Description>
        ) : null}
        {children}
        <RadixDialog.Close
          className="ui-dialog-close"
          aria-label="Close navigation"
        >
          <Cross2Icon width="18" height="18" />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
