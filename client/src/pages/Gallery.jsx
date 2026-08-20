import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Database } from 'lucide-react'

import { useItems } from '../hooks/useItems.js'
import { useCatalogSearch } from '../hooks/useCatalogSearch.js'
import ItemCard from '../components/gallery/ItemCard.jsx'
import CategoryPie from '../components/gallery/CategoryPie.jsx'
import LoadingGrid from '../components/ui/LoadingGrid.jsx'
import ErrorPanel from '../components/ui/ErrorPanel.jsx'

/**
 * Galería pública.
 * - Datos desde el backend (Google Sheets o mock cuando no hay credenciales).
 * - Búsqueda en tiempo real (input local sincronizado con `?q=`).
 * - Filtro por categoría vía pie chart interactivo.
 */
export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, source, loading, error } = useItems()

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
  const totalDisp = useMemo(
    () => filtered.reduce((sum, it) => sum + it.disponibles, 0),
    [filtered],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl font-bold">Catálogo</h1>
          <p className="mt-1 text-sm text-ink-400">
            Explora los artículos disponibles para arriendo. Filtra por categoría o busca por nombre.
          </p>
        </div>
        {source && (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-ink-700 px-2 py-1 text-[11px] uppercase tracking-wider text-ink-400"
            title={source === 'sheets' ? 'Datos desde Google Sheets' : 'Datos de ejemplo (mock)'}
          >
            <Database className="h-3 w-3" />
            {source === 'sheets' ? 'Google Sheets' : 'datos mock'}
          </span>
        )}
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

            <div className="card p-4">
              <div className="flex items-center gap-2 text-ink-100">
                <SlidersHorizontal className="h-4 w-4 text-brand-500" />
                <h3 className="text-sm font-semibold">Resumen</h3>
              </div>
              <dl className="mt-3 space-y-1 text-sm text-ink-300">
                <div className="flex justify-between"><dt>Artículos</dt><dd>{loading ? '…' : filtered.length}</dd></div>
                <div className="flex justify-between"><dt>Unidades disponibles</dt><dd>{loading ? '…' : totalDisp}</dd></div>
                <div className="flex justify-between">
                  <dt>Categoría activa</dt>
                  <dd className="text-brand-400">{category === 'Todas' ? '—' : category}</dd>
                </div>
              </dl>
            </div>
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
    </div>
  )
}
