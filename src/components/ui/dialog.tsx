'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { Button } from './button';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const;

/**
 * Accessible modal dialog: portal, focus trap, Escape + overlay dismissal.
 * The panel is exposed as `role="dialog" aria-modal="true"` with
 * `aria-labelledby`/`aria-describedby` pointing at the title/description.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  // Track mount separately from `open` so the portal target exists before the
  // first render that needs it (React portals require an existing DOM node).
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Re-render once mounted so an open dialog actually portals on the client.
  const [, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  // `isClient` guards the SSR pass; `mounted` must already be true when `open`
  // is first set because the component is rendered inside a client tree.
  if (!open || !mounted.current) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-label={title ? undefined : 'Dialog'}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full animate-fade-up rounded-dialog border border-border bg-surface shadow-soft-3 focus:outline-none',
          sizeClass[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-2">
          <div className="flex flex-col gap-1">
            {title && (
              <h2 id={titleId} className="font-display text-xl font-semibold tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="text-xs text-foreground-secondary">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <div className="p-6 pt-2">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border p-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
