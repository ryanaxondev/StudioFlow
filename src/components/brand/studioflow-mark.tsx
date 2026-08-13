import type { ComponentPropsWithoutRef } from "react";

import { cn } from "../../lib/cn";

export function StudioFlowMark({
  className,
  ...props
}: Readonly<ComponentPropsWithoutRef<"svg">>) {
  return (
    <svg
      className={cn("studioflow-mark", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path className="studioflow-mark-track" d="M5 5.25 12 12l7 6.75" />
      <rect
        className="studioflow-mark-node studioflow-mark-node-start"
        x="1.75"
        y="2"
        width="6.5"
        height="6.5"
        rx="2.15"
      />
      <rect
        className="studioflow-mark-node studioflow-mark-node-mid"
        x="8.75"
        y="8.75"
        width="6.5"
        height="6.5"
        rx="2.15"
      />
      <rect
        className="studioflow-mark-node studioflow-mark-node-end"
        x="15.75"
        y="15.5"
        width="6.5"
        height="6.5"
        rx="2.15"
      />
      <circle className="studioflow-mark-core" cx="12" cy="12" r="1.15" />
    </svg>
  );
}
