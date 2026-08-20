import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

/**
 * Contexto de autenticación admin.
 *
 * Consulta /api/auth/me al montar para saber si hay sesión activa (cookie).
 * NO guarda tokens en localStorage — la cookie HttpOnly es la única fuente.
 * Expone { user, loading, login, logout } para el resto de la app.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true })

  useEffect(() => {
    const ctrl = new AbortController()
    api.me(ctrl.signal)
      .then((res) => setState({ user: res.user, loading: false }))
      .catch(() => setState({ user: null, loading: false }))
    return () => ctrl.abort()
  }, [])

  const login = useCallback(async (username, password) => {
    const res = await api.login(username, password)
    setState({ user: res.user, loading: false })
    return res.user
  }, [])

  const logout = useCallback(async () => {
    try { await api.logout() } catch { /* ignore */ }
    setState({ user: null, loading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Exportamos hook + provider desde el mismo archivo a propósito para no
// dispersar el estado de auth. React Fast Refresh se queja pero es un
// patrón conocido en providers de auth.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
