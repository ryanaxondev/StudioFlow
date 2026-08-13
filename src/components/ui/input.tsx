import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "../../lib/cn";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("ui-input", className)} {...props} />;
});

export function Field({
  label,
  htmlFor,
  help,
  error,
  children,
}: Readonly<{
  label: string;
  htmlFor: string;
  help?: string;
  error?: string;
  children: ReactNode;
}>) {
  return (
    <div className="ui-field">
      <label className="ui-field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {help ? <p className="ui-field-help">{help}</p> : null}
      {error ? (
        <p className="ui-field-error" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
