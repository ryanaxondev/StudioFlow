import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

export function TextLink({
  className,
  children,
  ...props
}: LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  Readonly<{ children: ReactNode }>) {
  return (
    <Link className={cn("ui-link", className)} {...props}>
      {children}
    </Link>
  );
}
