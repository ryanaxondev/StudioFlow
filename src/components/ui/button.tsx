import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export type ButtonVariant =
  | "primary"
  | "client-primary"
  | "secondary"
  | "tertiary"
  | "danger"
  | "secondary-danger";

export type ButtonSize = "sm" | "md" | "lg";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> &
    Readonly<{ variant?: ButtonVariant; size?: ButtonSize }>
>(function Button(
  { className, variant = "secondary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn("ui-button", className)}
      data-variant={variant}
      data-size={size}
      {...props}
    />
  );
});
