/**
 * Wrapper mínimo sobre fetch para hablar con el backend.
 *
 * - En dev, Vite proxya /api/* al servidor Express (:4000).
 * - En prod, VITE_API_BASE_URL apunta al backend desplegado (Railway).
 * - `credentials: 'include'` para cookies HttpOnly de auth.
 * - En mutaciones (POST/PATCH/DELETE), incluye el header X-CSRF-Token
 *   leído de la cookie `sr_csrf` (patrón double-submit).
 */
const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

function readCookie(name) {
  const raw = document.cookie
  if (!raw) return null
  const target = name + '='
  for (const chunk of raw.split(';')) {
    const c = chunk.trim()
    if (c.startsWith(target)) return decodeURIComponent(c.slice(target.length))
  }
  return null
}

async function primeCsrfIfMissing() {
  if (readCookie('sr_csrf')) return
  // Un GET no-mutante hace que el backend emita la cookie.
  try { await fetch(`${BASE}/api/health`, { credentials: 'include' }) } catch { /* noop */ }
}

async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const upper = method.toUpperCase()
  if (MUTATION_METHODS.has(upper)) await primeCsrfIfMissing()

  const csrf = MUTATION_METHODS.has(upper) ? readCookie('sr_csrf') : null

  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    signal,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
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

  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: (signal) => request('/api/auth/me', { signal }),
  refresh: () => request('/api/auth/refresh', { method: 'POST' }),

  createItem: (payload) => request('/api/items', { method: 'POST', body: payload }),
  updateItem: (id, patch) => request(`/api/items/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch }),
  setDisponibles: (id, disponibles) =>
    request(`/api/items/${encodeURIComponent(id)}/disponibles`, { method: 'PATCH', body: { disponibles } }),
  deleteItem: (id) => request(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  audit: (signal) => request('/api/audit', { signal }),
}
