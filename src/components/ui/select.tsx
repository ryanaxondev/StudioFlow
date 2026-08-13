"use client";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Select as RadixSelect } from "radix-ui";

export type SelectItem = Readonly<{
  value: string;
  label: string;
  disabled?: boolean;
}>;

export function Select({
  ariaLabel,
  name,
  placeholder,
  items,
  value,
  defaultValue,
  onValueChange,
  disabled,
}: Readonly<{
  ariaLabel: string;
  name?: string;
  placeholder?: string;
  items: readonly SelectItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>) {
  return (
    <RadixSelect.Root
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <RadixSelect.Trigger className="ui-select-trigger" aria-label={ariaLabel}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon aria-hidden="true">
          <ChevronDownIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className="ui-select-content"
          position="popper"
          sideOffset={6}
        >
          <RadixSelect.Viewport className="ui-select-viewport">
            {items.map((item) => (
              <RadixSelect.Item
                className="ui-select-item"
                key={item.value}
                value={item.value}
                disabled={item.disabled}
              >
                <RadixSelect.ItemIndicator aria-hidden="true">
                  <CheckIcon />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{item.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
