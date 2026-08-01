'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react';
import { navSections } from '@/lib/nav';
import { useSidebarStore } from '@/stores/sidebar-store';
import { cn } from '@/lib/cn';
import { Tooltip } from '@/components/ui/tooltip';

/**
 * Primary navigation rail. Grouped by section (Command / Operate / Govern /
 * Workspace), collapsible to an icon strip, with the active route highlighted.
 * "Signature" items get a subtle gold marker.
 */
export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggleCollapsed);

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface/60 backdrop-blur-xl transition-all duration-base ease-astroid lg:flex',
        collapsed ? 'w-[76px]' : 'w-[248px]',
      )}
    >
      {/* Brand */}
      <div className={cn('flex h-16 items-center gap-2.5 px-5', collapsed && 'justify-center px-0')}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-button bg-accent-gradient text-white shadow-gold">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        {!collapsed && (
          <span className="font-display text-lg font-semibold tracking-tight">Astroid</span>
        )}
      </div>

      {/* Sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.heading} className="space-y-1">
            {!collapsed && (
              <p className="px-3 pb-1 text-2xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                {section.heading}
              </p>
            )}
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-button px-3 py-2 text-sm font-medium transition-colors duration-fast',
                    collapsed && 'justify-center px-0',
                    active
                      ? 'bg-surface-secondary text-foreground'
                      : 'text-foreground-secondary hover:bg-surface-secondary/60 hover:text-foreground',
                  )}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold"
                      aria-hidden
                    />
                  )}
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.signature && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
                  )}
                </Link>
              );
              return collapsed ? (
                <Tooltip key={item.href} content={item.label} side="right">
                  {link}
                </Tooltip>
              ) : (
                link
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'flex w-full items-center gap-3 rounded-button px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors duration-fast hover:bg-surface-secondary/60 hover:text-foreground',
            collapsed && 'justify-center px-0',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-[18px] w-[18px]" aria-hidden />
          ) : (
            <>
              <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
