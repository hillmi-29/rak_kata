import type { ApiResponse } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, status = 500, code = 'UNKNOWN', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
      .then(response => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized = true
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(
      'Tidak dapat terhubung ke server. Pastikan API sedang berjalan.',
      0,
      'NETWORK_ERROR'
    );
  }

  if (response.status === 401 && retryOnUnauthorized && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();
    if (refreshed) return apiFetch<T>(path, options, false);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.error?.message || 'Terjadi kesalahan pada server',
      response.status,
      payload?.error?.code || 'REQUEST_FAILED',
      payload?.error?.details
    );
  }

  return payload as ApiResponse<T>;
}

export const api = {
  get<T>(path: string) {
    return apiFetch<T>(path);
  },
  post<T>(path: string, body?: unknown) {
    return apiFetch<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  patch<T>(path: string, body?: unknown) {
    return apiFetch<T>(path, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  delete<T>(path: string) {
    return apiFetch<T>(path, { method: 'DELETE' });
  },
};

export function queryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const result = search.toString();
  return result ? `?${result}` : '';
}
