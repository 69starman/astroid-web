'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
  href?: string;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: (DropdownItem | 'separator')[];
  align?: 'start' | 'end';
  className?: string;
}

/** Click-to-open menu with outside-click + Escape dismissal. */
export function Dropdown({ trigger, items, align = 'end', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex focus-visible:outline-none"
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            'glass absolute top-full z-50 mt-2 min-w-[200px] animate-fade-in overflow-hidden rounded-md p-1.5 shadow-soft-2',
            align === 'end' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {items.map((item, i) => {
            if (item === 'separator') {
              return <div key={`sep-${i}`} className="my-1 h-px bg-border" />;
            }
            const content = (
              <>
                {item.icon && (
                  <span className="shrink-0 text-foreground-secondary">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </>
            );
            const classes = cn(
              'flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-xs font-medium transition-colors duration-fast focus-visible:outline-none focus-visible:bg-surface-secondary',
              item.destructive
                ? 'text-danger hover:bg-danger-soft'
                : 'text-foreground hover:bg-surface-secondary',
              item.disabled && 'pointer-events-none opacity-50',
            );
            if (item.href) {
              return (
                <a key={item.label} href={item.href} role="menuitem" className={classes}>
                  {content}
                </a>
              );
            }
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
                className={classes}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
