import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Zap } from 'lucide-react'

const NAV_LINKS = [
  { to: '/catalogo',       label: 'Catálogo' },
  { to: '/quienes-somos',  label: 'Quiénes somos' },
  { to: '/mision',         label: 'Misión' },
  { to: '/redes',          label: 'Redes' },
  { to: '/contacto',       label: 'Contacto' },
]

/**
 * Navbar con:
 *  - Logotipo enlazado a home
 *  - Enlaces principales (colapsables en móvil)
 *  - Barra de búsqueda SIEMPRE visible — al enviar empuja a /catalogo?q=...
 */
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  function onSearchSubmit(e) {
    e.preventDefault()
    const value = q.trim()
    // Ir al catálogo (aunque estemos en él, el query param lo recogerá el hook)
    navigate(value ? `/catalogo?q=${encodeURIComponent(value)}` : '/catalogo')
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-brand-500">
          <Zap className="h-6 w-6 fill-brand-500" aria-hidden />
          <span>
            Siete<span className="text-ink-50">Rayos</span>
          </span>
        </Link>

        {/* Búsqueda persistente — protagonista */}
        <form
          role="search"
          onSubmit={onSearchSubmit}
          className="ml-auto hidden flex-1 max-w-md md:flex"
          aria-label="Buscar artículos"
        >
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en el catálogo…"
              className="input pl-9"
              aria-label="Buscar en el catálogo"
            />
          </div>
        </form>

        <nav className="ml-auto hidden items-center gap-1 md:ml-0 md:flex" aria-label="Principal">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-400'
                    : 'text-ink-200 hover:text-brand-400'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/admin/login" className="btn-outline ml-2">
            Admin
          </Link>
        </nav>

        <button
          type="button"
          className="ml-auto rounded-md p-2 text-ink-200 hover:bg-ink-800 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Móvil: menú + búsqueda */}
      {open && (
        <div id="mobile-nav" className="border-t border-ink-800 md:hidden">
          <div className="space-y-3 px-4 py-4">
            <form role="search" onSubmit={onSearchSubmit}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar en el catálogo…"
                  className="input pl-9"
                  aria-label="Buscar en el catálogo"
                />
              </div>
            </form>
            <nav className="flex flex-col" aria-label="Principal móvil">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'text-brand-400' : 'text-ink-100 hover:bg-ink-800'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link
                to="/admin/login"
                onClick={() => setOpen(false)}
                className="mt-2 btn-outline"
              >
                Admin
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
