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
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/50 backdrop-blur-sm transition-opacity duration-base',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="AI assistant"
        aria-modal="true"
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col border-l border-border bg-surface shadow-soft-3 transition-transform duration-base ease-astroid',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <span className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-button bg-accent-gradient text-white">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-display text-base font-semibold">Assistant</span>
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

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
            >
              {msg.role === 'assistant' ? (
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-soft text-gold">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                </span>
              ) : (
                <Avatar name="You" size="xs" />
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-md px-3.5 py-2.5 text-sm',
                  msg.role === 'user'
                    ? 'bg-accent-gradient text-white'
                    : 'bg-surface-secondary text-foreground',
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {messages.length > 0 && suggestions.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-2xs font-semibold uppercase tracking-wide text-foreground-muted">
                Suggested
              </p>
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => send(s.prompt)}
                  className="group flex w-full items-center justify-between gap-2 rounded-sm border border-border bg-surface px-3 py-2 text-left text-xs text-foreground-secondary transition-colors duration-fast hover:border-gold hover:text-foreground"
                >
                  <span>{s.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          className="shrink-0 border-t border-border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <div className="flex items-end gap-2 rounded-md border border-border bg-surface px-3 py-2 focus-within:border-border-strong">
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
              placeholder="Ask about spend, policies, agents…"
              className="max-h-32 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-button bg-accent-gradient text-white transition-opacity duration-fast disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
