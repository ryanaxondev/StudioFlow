"use client";

import { Avatar as RadixAvatar } from "radix-ui";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  src,
}: Readonly<{ name: string; src?: string }>) {
  return (
    <RadixAvatar.Root className="ui-avatar">
      {src ? (
        <RadixAvatar.Image className="ui-avatar-image" src={src} alt="" />
      ) : null}
      <RadixAvatar.Fallback delayMs={src ? 250 : 0}>
        {initials(name) || "?"}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
