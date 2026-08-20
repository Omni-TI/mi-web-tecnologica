import { Link, NavLink, Outlet } from 'react-router-dom'
import { LogOut, LayoutGrid, Zap } from 'lucide-react'

/**
 * Layout admin. En Fase 3 se envolverá con <AuthGuard/> que verifica JWT.
 * Por ahora es solo estructura — el dashboard es placeholder.
 */
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-ink-950 text-ink-50">
      <aside className="hidden w-64 shrink-0 border-r border-ink-800 bg-ink-900 md:flex md:flex-col">
        <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-4 font-display text-lg font-bold text-brand-500">
          <Zap className="h-5 w-5 fill-brand-500" aria-hidden />
          <span>SieteRayos · Admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4" aria-label="Navegación admin">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-ink-800 text-brand-400' : 'text-ink-200 hover:bg-ink-800'
              }`
            }
          >
            <LayoutGrid className="h-4 w-4" /> Inventario
          </NavLink>
        </nav>
        <div className="border-t border-ink-800 p-3">
          <Link to="/admin/login" className="btn-ghost w-full justify-start">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Link>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-ink-800 bg-ink-900 px-4 py-3 md:px-6">
          <h1 className="font-display text-lg font-semibold">Panel de administración</h1>
          <span className="hidden text-xs text-ink-400 sm:inline">
            Autenticación pendiente — Fase 3
          </span>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
