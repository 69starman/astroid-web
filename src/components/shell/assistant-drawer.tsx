'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Send, ArrowUpRight } from 'lucide-react';
import { useAssistantStore } from '@/stores/ui-store';
import { useAssistantSeed, useBriefing } from '@/hooks/use-queries';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import type { ChatMessage } from '@/types/domain';

/**
 * Slide-over AI assistant. Seeds from the mock conversation and the daily
 * briefing's suggested prompts. Composer is local-only (no backend in mock
 * mode) — sending appends an optimistic user turn plus a canned acknowledgement
 * so the interaction reads end-to-end.
 */
export function AssistantDrawer() {
  const open = useAssistantStore((s) => s.open);
  const setOpen = useAssistantStore((s) => s.setOpen);
  const seedQuery = useAssistantSeed();
  const briefingQuery = useBriefing();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [seeded, setSeeded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Seed the transcript once the mock conversation resolves.
  useEffect(() => {
    if (!seeded && seedQuery.data) {
      setMessages(seedQuery.data);
      setSeeded(true);
    }
  }, [seeded, seedQuery.data]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [open, messages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setOpen]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const stamp = new Date(0).toISOString();
    setMessages((prev) => [
      ...prev,
      { id: `local-u-${prev.length}`, role: 'user', content: trimmed, createdAt: stamp },
      {
        id: `local-a-${prev.length}`,
        role: 'assistant',
        content:
          'I can help with that. In this preview the assistant is running in mock mode, so I can outline the steps but not execute live actions yet.',
        createdAt: stamp,
      },
    ]);
    setDraft('');
  };

  const suggestions = briefingQuery.data?.suggestedActions ?? [];

  return (
    <>
      {/* Floating Bottom-Right AI Widget */}
      <div
        className={cn(
          'fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end justify-end transition-all duration-base ease-astroid',
          open ? 'opacity-100 scale-100 pointer-events-auto origin-bottom-right' : 'opacity-0 scale-95 pointer-events-none origin-bottom-right',
        )}
      >
        <div
          role="dialog"
          aria-label="AI Executive Command Terminal"
          aria-modal="false"
          className="relative flex h-[580px] max-h-[calc(100vh-120px)] w-[400px] max-w-[calc(100vw-48px)] flex-col rounded-card border border-border-strong bg-surface/95 shadow-raised backdrop-blur-xl overflow-hidden"
        >
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5 bg-surface-secondary/40">
            <span className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-button bg-accent-gradient text-background-secondary shadow-sm">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-sm font-semibold leading-tight">Command Terminal</h3>
                <p className="text-2xs text-foreground-secondary">Autonomous AI Copilot</p>
              </div>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-button text-foreground-secondary transition-colors duration-fast hover:bg-surface-secondary hover:text-foreground"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
              >
                {msg.role === 'assistant' ? (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gold-soft text-gold font-mono text-xs">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  </span>
                ) : (
                  <Avatar name="You" size="xs" />
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-card p-3.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-accent-gradient text-background-secondary font-medium shadow-sm'
                      : 'border border-border bg-surface-secondary/60 text-foreground',
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {messages.length > 0 && suggestions.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <p className="text-2xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Suggested Actions
                </p>
                <div className="flex flex-col gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => send(s.prompt)}
                      className="group flex items-center justify-between gap-2 rounded-button border border-border bg-surface p-3 text-left text-xs text-foreground-secondary transition-all duration-fast hover:border-gold hover:text-foreground"
                    >
                      <span className="truncate">{s.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            className="shrink-0 border-t border-border bg-surface-secondary/30 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <div className="flex items-end gap-2 rounded-button border border-border bg-surface px-3 py-2 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold transition-colors">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
                rows={1}
                placeholder="Ask about spend, policies..."
                className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-foreground-muted"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-button bg-accent-gradient text-background-secondary font-semibold transition-opacity duration-fast disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
