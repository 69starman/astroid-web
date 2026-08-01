'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { MobileNav } from '@/components/shell/mobile-nav';
import { CommandPalette } from '@/components/shell/command-palette';
import { AssistantDrawer } from '@/components/shell/assistant-drawer';

/**
 * The authenticated workspace shell: a persistent sidebar, a top bar, and the
 * global overlays (command palette, AI assistant, mobile nav). Page content
 * renders in the scrollable main column, capped to the shell max width.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenNav={() => setNavOpen(true)} />
        <main id="main-content" className="flex-1">
          <div className="mx-auto w-full max-w-shell px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
      <CommandPalette />
      <AssistantDrawer />
    </div>
  );
}
