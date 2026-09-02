import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

/**
 * Envuelve rutas /admin. Redirige a /admin/login si no hay sesión.
 * Guarda la URL a la que iban en `state.from` para volver tras login.
 */
export default function AuthGuard() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-ink-400">
        Verificando sesión…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
