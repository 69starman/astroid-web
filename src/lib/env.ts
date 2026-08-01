/**
 * Runtime environment configuration.
 *
 * When `NEXT_PUBLIC_API_URL` is empty the client runs in mock mode and every
 * screen renders realistic data without a backend. Set the variable to point the
 * typed API client at a live Astroid API.
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  apiVersion: process.env.NEXT_PUBLIC_API_VERSION ?? '/api/v1',
} as const;

/** True when no API base is configured — the app serves mock data. */
export const isMockMode = env.apiUrl.trim().length === 0;
