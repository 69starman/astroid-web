'use client';

import { Bell, LayoutDashboard, SunMoon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, Select, Switch } from '@/components/ui/input';
import { usePreferencesStore, useHydrated, type NotificationPreferences, type DashboardDensity } from '@/stores';
import type { ThemeMode } from '@/stores/theme-store';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Match system' },
];

const DENSITY_OPTIONS: { value: DashboardDensity; label: string }[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

const NOTIFICATION_CHANNELS: { key: keyof NotificationPreferences; label: string }[] = [
  { key: 'proposals', label: 'Proposal created / decided' },
  { key: 'budgetAlerts', label: 'Budget threshold alerts' },
  { key: 'riskAlerts', label: 'Risk & anomaly alerts' },
  { key: 'weeklyDigest', label: 'Weekly digest' },
];

/**
 * Workspace preference controls backed by the persisted preferences store.
 * Persisted values are gated behind {@link useHydrated} so the server-rendered
 * markup always matches the first client render (no hydration mismatch).
 */
export function PreferencesPanel() {
  const hydrated = useHydrated();

  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const density = usePreferencesStore((s) => s.density);
  const setDensity = usePreferencesStore((s) => s.setDensity);
  const notifications = usePreferencesStore((s) => s.notifications);
  const toggleNotification = usePreferencesStore((s) => s.toggleNotification);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <SunMoon className="h-4 w-4 text-gold" aria-hidden />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <FormField
            label="Theme"
            htmlFor="pref-theme"
            hint="Applies instantly and persists across sessions."
          >
            <Select
              id="pref-theme"
              value={hydrated ? themeMode : 'light'}
              onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
            >
              {THEME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Dashboard density"
            htmlFor="pref-density"
            hint="Compact tightens table rows and card padding across the workspace."
          >
            <Select
              id="pref-density"
              value={hydrated ? density : 'comfortable'}
              onChange={(e) => setDensity(e.target.value as DashboardDensity)}
            >
              {DENSITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4 text-gold" aria-hidden />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {NOTIFICATION_CHANNELS.map(({ key, label }) => (
              <li key={key} className="flex items-center justify-between gap-4">
                <span className="text-xs text-foreground">{label}</span>
                <Switch
                  id={`pref-notification-${key}`}
                  checked={hydrated ? notifications[key] : false}
                  onCheckedChange={() => toggleNotification(key)}
                  aria-label={label}
                />
              </li>
            ))}
          </ul>
          <p className="mt-5 flex items-start gap-1.5 text-2xs text-foreground-muted">
            <LayoutDashboard className="mt-px h-3 w-3 shrink-0" aria-hidden />
            Preferences persist locally and survive reloads.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
