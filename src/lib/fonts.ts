import { JetBrains_Mono, Manrope, Space_Grotesk } from 'next/font/google';

/**
 * Font loading strategy (PRD Doc 9).
 *
 * The brand faces are Clash Display (display), Satoshi (interface) and JetBrains
 * Mono (monospace). Clash Display and Satoshi are commercial faces that are not
 * available on an open font CDN, so — per the PRD instruction to never rely on
 * paid/unavailable downloads that break the build — we load close open-source
 * substitutes through `next/font` and expose them as CSS variables. The Tailwind
 * `fontFamily` stacks list the real brand names first, so if an organization
 * self-hosts the licensed faces they take over automatically with zero code
 * changes; otherwise the substitute renders, and system fonts are the final
 * fallback. `next/font` self-hosts the files at build time (no runtime request).
 */

export const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

export const fontSans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
});

export const fontVariables = `${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`;
