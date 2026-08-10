# astroid-web

> Next.js frontend and design system — the **presentation layer** of Astroid, the Financial Operating System for autonomous AI agents on Stellar.

An editorial financial dashboard for governing autonomous AI spend: agents, wallets, policies, budgets, approvals, transactions, memory, risk analytics, and audit history. Restrained and typographic — oversized display numbers, gold used sparingly, hairline dividers, illustrated empty states, and deltas that always carry text or an arrow, never color alone.

## Highlights

- **Next.js 14 App Router** with a `(dashboard)` route group; 22 pages across list and detail views.
- **Bespoke design system** — a warm-neutral palette with a gold accent, custom Tailwind tokens, `framer-motion`, and hand-drawn illustrations. Design tokens are the single source of truth (see `tailwind.config.ts`).
- **Data layer** — TanStack Query hooks over a typed service layer. **No backend required to run:** when `NEXT_PUBLIC_API_URL` is unset, a complete mock dataset renders every screen.
- **Strict TypeScript** — `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`. No `any`, no placeholder content.

## Quick start

```bash
npm install
cp .env.example .env.local      # optional — leave NEXT_PUBLIC_API_URL empty for mock mode
npm run dev                     # http://localhost:3001
```

Point it at a live backend by setting `NEXT_PUBLIC_API_URL` (see [`astroid-api`](https://github.com/ASTROIDX556/astroid-api)):

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_VERSION=/api/v1
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `next lint` |

## Structure

```
src/
  app/(dashboard)/   route group — overview, agents, wallets, policies, budgets,
                     transactions, approvals, memory, analytics, audit,
                     notifications, developers, settings (+ [id] detail pages)
  components/        ui/ · dashboard/ · charts/ · layout/ · shell/ · illustrations
  hooks/             TanStack Query hooks (use-queries)
  services/          typed API client + mock/ dataset
  lib/               format, status, and utility helpers
  stores/            Zustand stores
  styles/            globals.css + design tokens
```

## Tech stack

Next.js 14 · React 18 · TypeScript (strict) · Tailwind CSS · TanStack Query & Table · Zustand · React Hook Form + Zod · Recharts · framer-motion · lucide-react · sonner.

## License

MIT — see [LICENSE](LICENSE). Part of the [Astroid](https://github.com/ASTROIDX556) open-source platform.
