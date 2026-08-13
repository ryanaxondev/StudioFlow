import type { ReactNode } from "react";

export function Status({
  tone = "neutral",
  children,
}: Readonly<{
  tone?: "neutral" | "info" | "success" | "warning" | "danger" | "revision";
  children: ReactNode;
}>) {
  return (
    <span className="ui-status" data-tone={tone}>
      {children}
    </span>
  );
}
