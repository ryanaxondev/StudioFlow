"use client";

import { CheckIcon } from "@radix-ui/react-icons";
import { Checkbox as RadixCheckbox } from "radix-ui";

export function Checkbox({
  id,
  label,
  name,
  defaultChecked,
  disabled,
}: Readonly<{
  id: string;
  label: string;
  name?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}>) {
  return (
    <label className="ui-checkbox-row" htmlFor={id}>
      <RadixCheckbox.Root
        className="ui-checkbox"
        id={id}
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
      >
        <RadixCheckbox.Indicator>
          <CheckIcon />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <span>{label}</span>
    </label>
  );
}
