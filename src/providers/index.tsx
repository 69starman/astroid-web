'use client';

import { Toaster } from 'sonner';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

/** Root client provider stack: theme tokens, data layer, and toasts. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                'glass !rounded-md !border-border !text-foreground !shadow-soft-2 font-sans',
              description: '!text-foreground-secondary',
            },
          }}
        />
      </QueryProvider>
    </ThemeProvider>
  );
}
