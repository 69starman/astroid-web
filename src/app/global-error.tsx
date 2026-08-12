'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Global error boundary — catches crashes that happen outside the dashboard
 * route segment (e.g. in the root layout, providers, or auth pages).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Astroid Global Error]', error);
  }, [error]);

  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-[#0A0A0A] font-sans text-[#F6F2EA] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6 rounded-xl border border-dashed border-red-500/40 bg-red-950/20 p-10 text-center max-w-md w-full">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-red-950 text-red-400">
            <AlertTriangle className="h-7 w-7" aria-hidden />
          </span>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">
              Something went wrong
            </h2>
            <p className="text-sm text-[#AAAAAA]">
              {error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-[#F6F2EA] px-5 py-2.5 text-sm font-medium text-[#0A0A0A] hover:opacity-80 transition-opacity"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
