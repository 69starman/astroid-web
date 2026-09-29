'use client';

import { useState } from 'react';

import { Topbar } from '@/components/shell/topbar';
import { CommandDock } from '@/components/shell/command-dock';
import { MobileNav } from '@/components/shell/mobile-nav';
import { CommandPalette } from '@/components/shell/command-palette';
import { AssistantDrawer } from '@/components/shell/assistant-drawer';
import { usePreferencesStore, useHydrated } from '@/stores';
import { cn } from '@/lib/cn';

/**
 * The authenticated workspace shell: a slim utility top bar, the floating
 * command dock (primary navigation on desktop), and the global overlays
 * (command palette, AI assistant, mobile nav drawer). Page content renders in
 * the scrollable main column, capped to the shell max width, with bottom room
 * so the dock never occludes it.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  // Density is a persisted preference; gate the read so SSR markup always
  // renders the default and upgrades after rehydration (no mismatch).
  const hydrated = useHydrated();
  const compact = usePreferencesStore((s) => s.density === 'compact');

  return (
    <div
      data-density={hydrated && compact ? 'compact' : 'comfortable'}
      className={cn(
        'flex min-h-screen flex-col bg-background',
        hydrated && compact && 'text-[13px]',
      )}
    >
      <Topbar onOpenNav={() => setNavOpen(true)} />

      <main id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-28">
          {children}
        </div>
      </main>

      <CommandDock />
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
      <CommandPalette />
      <AssistantDrawer />
    </div>
  );
}
