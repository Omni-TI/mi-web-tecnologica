/**
 * Wrapper mínimo sobre fetch para hablar con el backend.
 *
 * - En dev, Vite proxya /api/* al servidor Express (:4000).
 * - En prod, VITE_API_BASE_URL apunta al backend desplegado (Railway).
 * - `credentials: 'include'` porque la auth admin (Fase 3) usa cookies HttpOnly.
 */
const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    method,
    credentials: 'include',
    signal,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  const data = text ? safeParse(text) : null
  if (!res.ok) {
    const message = data?.error || res.statusText || 'Error de red'
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

function safeParse(t) {
  try { return JSON.parse(t) } catch { return t }
}

export const api = {
  getItems: (signal) => request('/api/items', { signal }),
  getCategories: (signal) => request('/api/items/categories', { signal }),
  health: (signal) => request('/api/health', { signal }),

  // Auth
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: (signal) => request('/api/auth/me', { signal }),
  refresh: () => request('/api/auth/refresh', { method: 'POST' }),

  // Admin CRUD
  createItem: (payload) => request('/api/items', { method: 'POST', body: payload }),
  updateItem: (id, patch) => request(`/api/items/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch }),
  deleteItem: (id) => request(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
