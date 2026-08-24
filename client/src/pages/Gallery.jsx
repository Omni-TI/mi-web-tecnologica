import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'

import { useItems } from '../hooks/useItems.js'
import { useCatalogSearch } from '../hooks/useCatalogSearch.js'
import ItemCard from '../components/gallery/ItemCard.jsx'
import CategoryPie from '../components/gallery/CategoryPie.jsx'
import LoadingGrid from '../components/ui/LoadingGrid.jsx'
import ErrorPanel from '../components/ui/ErrorPanel.jsx'
import ScrollToTopButton from '../components/ui/ScrollToTopButton.jsx'

/**
 * Galería pública.
 * - Datos desde el backend (Google Sheets o mock cuando no hay credenciales).
 * - Búsqueda en tiempo real (input local sincronizado con `?q=`).
 * - Filtro por categoría vía pie chart interactivo.
 */
export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, loading, error } = useItems()

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState(searchParams.get('cat') ?? 'Todas')

  // URL <-> filtros para compartir enlaces.
  useEffect(() => {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (category && category !== 'Todas') next.set('cat', category)
    setSearchParams(next, { replace: true })
  }, [q, category, setSearchParams])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ(searchParams.get('q') ?? '')
  }, [searchParams])

  const filtered = useCatalogSearch(items, q, category)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Catálogo</h1>
        <p className="mt-1 text-sm text-ink-400">
          Explora los artículos disponibles para arriendo. Filtra por categoría o busca por nombre.
        </p>
      </header>

      {error ? (
        <ErrorPanel error={error} onRetry={() => window.location.reload()} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            {loading ? (
              <div className="card h-64 animate-pulse" aria-hidden />
            ) : (
              <CategoryPie items={items} active={category} onSelect={setCategory} />
            )}
          </aside>

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nombre (exacto o similar)…"
                  className="input pl-9"
                  aria-label="Buscar en el catálogo"
                  disabled={loading}
                />
              </label>
              {(q || (category && category !== 'Todas')) && (
                <button
                  type="button"
                  onClick={() => { setQ(''); setCategory('Todas') }}
                  className="btn-ghost text-xs"
                >
                  <X className="h-3.5 w-3.5" /> Limpiar filtros
                </button>
              )}
            </div>

            {loading ? (
              <LoadingGrid />
            ) : filtered.length === 0 ? (
              <div className="card p-8 text-center text-ink-400">
                No encontramos artículos que coincidan.
                {q && <span> Prueba con un término más corto o revisa la ortografía.</span>}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((it) => (
                  <ItemCard key={it.id} item={it} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <ScrollToTopButton />
    </div>
  )
}
