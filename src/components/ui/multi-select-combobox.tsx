'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Command as CommandPrimitive } from 'cmdk';

const multiSelectVariants = cva(
  'm-0 flex flex-wrap gap-1 p-0',
  {
    variants: {
      variant: {
        default: 'border-0 bg-transparent',
        form:
          'rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface MultiSelectProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof multiSelectVariants> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxCount?: number;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value,
      onChange,
      variant,
      className,
      placeholder = 'Select options',
      maxCount = 5,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            if (input.value === '' && value.length > 0) {
              const newSelected = [...value];
              newSelected.pop();
              onChange(newSelected);
            }
          }
          if (e.key === 'Escape') {
            input.blur();
          }
        }
      },
      [value, onChange]
    );

    const selectables = options.filter((option) => !value.includes(option.value));

    return (
      <Command
        onKeyDown={handleKeyDown}
        className="overflow-visible bg-transparent"
      >
        <div
          ref={ref}
          className={cn(
            'group rounded-md border border-input text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            className
          )}
        >
          <div className="flex flex-wrap gap-1 p-2">
            {value.map((item) => {
              const option = options.find(opt => opt.value === item);
              return (
                <Badge
                  key={item}
                  variant="secondary"
                  className="gap-1 rounded-sm pr-1"
                >
                  {option?.label}
                  <button
                    className="rounded-full p-0.5 outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                         onChange(value.filter((i) => i !== item));
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => onChange(value.filter((i) => i !== item))}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              );
            })}

            <CommandPrimitive.Input
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="ml-2 flex-1 bg-transparent p-0 outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && selectables.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandList>
                <CommandGroup className="h-full overflow-auto">
                  {selectables.map((option) => (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        setInputValue('');
                        onChange([...value, option.value]);
                      }}
                      className={'cursor-pointer'}
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </div>
          ) : null}
        </div>
      </Command>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };
