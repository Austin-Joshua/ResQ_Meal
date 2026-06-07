import { getApiBasePath } from '@/lib/apiConfig';
import { getAuthToken, useAuthStore } from '@/store/authStore';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiEnvelope<T> = { success: boolean; data: T; message?: string | null };

function buildUrl(path: string): string {
  const base = getApiBasePath().replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function unwrap<T>(data: unknown): T {
  if (
    data &&
    typeof data === 'object' &&
    'success' in data &&
    'data' in data &&
    (data as ApiEnvelope<T>).success
  ) {
    return (data as ApiEnvelope<T>).data;
  }
  return data as T;
}

function handleUnauthorized(): void {
  useAuthStore.getState().logout();
  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    window.location.href = '/';
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  init?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const isAuthRequest = path.includes('/auth/login') || path.includes('/auth/register');

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: payload,
    ...init,
  });

  const data = await parseBody(response);

  if (!response.ok) {
    if (!isAuthRequest && response.status === 401) {
      handleUnauthorized();
    }
    const errBody = data as { message?: string; error?: string; errors?: string[] };
    const message = errBody?.message ?? errBody?.error ?? response.statusText ?? 'Request failed';
    throw new ApiError(message, response.status, data);
  }

  return unwrap<T>(data);
}

export async function upload<T>(path: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    const errBody = data as { message?: string; error?: string };
    const message = errBody?.message ?? errBody?.error ?? response.statusText ?? 'Upload failed';
    throw new ApiError(message, response.status, data);
  }

  return unwrap<T>(data);
}

export const get = <T>(path: string, init?: RequestInit): Promise<T> =>
  request<T>('GET', path, undefined, init);

export const post = <T>(path: string, body?: unknown, init?: RequestInit): Promise<T> =>
  request<T>('POST', path, body, init);

export const put = <T>(path: string, body?: unknown, init?: RequestInit): Promise<T> =>
  request<T>('PUT', path, body, init);

export const patch = <T>(path: string, body?: unknown, init?: RequestInit): Promise<T> =>
  request<T>('PATCH', path, body, init);

export const del = <T>(path: string, init?: RequestInit): Promise<T> =>
  request<T>('DELETE', path, undefined, init);

/** @deprecated Use named exports (`get`, `post`, etc.) instead. */
export const apiClient = { get, post, put, patch, del };
