import { env, isMockMode } from '@/lib/env';
import type { ApiResponse, ListQuery } from '@/types/api';

/** Thrown for any non-2xx API response with the machine-readable code. */
export class AstroidApiError extends Error {
  readonly code: string;
  readonly requestId?: string;

  constructor(code: string, message: string, requestId?: string) {
    super(message);
    this.name = 'AstroidApiError';
    this.code = code;
    this.requestId = requestId;
  }
}

const TOKEN_KEY = 'astroid_token';

/** Read the stored JWT access token (client-side only). */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Persist a JWT access token after login. */
export function storeToken(token: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}

/** Clear the stored token on logout. */
export function clearToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

function buildQuery(query?: ListQuery): string {
  if (!query) return '';
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.sort) params.set('sort', query.sort);
  if (query.order) params.set('order', query.order);
  if (query.search) params.set('search', query.search);
  for (const [key, value] of Object.entries(query.filter ?? {})) {
    params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * The typed Astroid API client.
 *
 * In mock mode (`NEXT_PUBLIC_API_URL` unset) callers should route through the
 * resource layer, which resolves against local mock data. When a base URL is
 * configured, `request` performs a real fetch against `${apiUrl}${apiVersion}`
 * and unwraps the standard `{ success, data, meta, requestId }` envelope.
 *
 * Authorization: every request automatically includes `Authorization: Bearer <token>`
 * when a token is stored (set by the auth page after successful login).
 */
export const apiClient = {
  isMock: isMockMode,

  async request<T>(
    path: string,
    init: RequestInit & { query?: ListQuery } = {},
  ): Promise<{ data: T; meta: ApiResponse<T> extends { meta: infer M } ? M : never }> {
    const { query, ...rest } = init;
    const url = `${env.apiUrl}${env.apiVersion}${path}${buildQuery(query)}`;

    const token = getStoredToken();
    const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(url, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...(rest.headers ?? {}),
      },
    });

    const body = (await res.json()) as ApiResponse<T>;
    if (!body.success) {
      throw new AstroidApiError(body.error.code, body.error.message, body.requestId);
    }
    return { data: body.data, meta: body.meta as never };
  },
};

