"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Dialog as RadixDialog } from "radix-ui";
import type { ReactNode } from "react";

export const Drawer = RadixDialog.Root;
export const DrawerTrigger = RadixDialog.Trigger;
export const DrawerClose = RadixDialog.Close;

export function DrawerContent({
  title,
  description,
  children,
}: Readonly<{ title: string; description?: string; children: ReactNode }>) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="ui-dialog-overlay" />
      <RadixDialog.Content className="ui-drawer-content">
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
          aria-label="Close drawer"
        >
          <Cross2Icon width="18" height="18" />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
