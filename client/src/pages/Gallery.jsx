import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, ArrowUpDown } from 'lucide-react'

import { useItems } from '../hooks/useItems.js'
import { useCatalogSearch } from '../hooks/useCatalogSearch.js'
import ItemCard from '../components/gallery/ItemCard.jsx'
import ItemDetailModal from '../components/gallery/ItemDetailModal.jsx'
import CategoryMenu from '../components/gallery/CategoryMenu.jsx'
import LoadingGrid from '../components/ui/LoadingGrid.jsx'
import ErrorPanel from '../components/ui/ErrorPanel.jsx'
import ScrollToTopButton from '../components/ui/ScrollToTopButton.jsx'

const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'nombre_az', label: 'Nombre: A-Z' },
  { value: 'nombre_za', label: 'Nombre: Z-A' },
]
const SORT_VALUES = new Set(SORT_OPTIONS.map((o) => o.value))

/**
 * Galería pública.
 * - Datos desde el backend (Google Sheets o mock cuando no hay credenciales).
 * - Búsqueda por texto + filtro por categoría/sub-categoría + ordenamiento,
 *   combinables entre sí. Estado sincronizado con la URL (?q=&cat=&sub=&sort=).
 */
export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, loading, error } = useItems()

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState(searchParams.get('cat') ?? 'Todas')
  const [subcategoria, setSubcategoria] = useState(searchParams.get('sub') ?? '')
  const [sort, setSort] = useState(() => {
    const s = searchParams.get('sort')
    return s && SORT_VALUES.has(s) ? s : 'relevancia'
  })

  // Filtros -> URL para compartir enlaces.
  useEffect(() => {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (category && category !== 'Todas') next.set('cat', category)
    if (subcategoria) next.set('sub', subcategoria)
    if (sort && sort !== 'relevancia') next.set('sort', sort)
    setSearchParams(next, { replace: true })
  }, [q, category, subcategoria, sort, setSearchParams])

  // URL -> búsqueda (p. ej. al buscar desde el navbar).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ(searchParams.get('q') ?? '')
  }, [searchParams])

  const filtered = useCatalogSearch(items, q, { category, subcategoria, sort })

  const [selected, setSelected] = useState(null) // artículo abierto en el modal de detalle

  const hasAnyFilter = q || (category && category !== 'Todas') || subcategoria || sort !== 'relevancia'
  function clearAll() {
    setQ('')
    setCategory('Todas')
    setSubcategoria('')
    setSort('relevancia')
  }

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
              <div className="card h-32 animate-pulse" aria-hidden />
            ) : (
              <CategoryMenu
                items={items}
                category={category}
                subcategoria={subcategoria}
                onChange={({ category: c, subcategoria: s }) => { setCategory(c); setSubcategoria(s) }}
              />
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

              {/* Ordenamiento */}
              <label className="relative w-full sm:w-auto">
                <span className="sr-only">Ordenar por</span>
                <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="input cursor-pointer pl-9 pr-8"
                  aria-label="Ordenar el catálogo"
                  disabled={loading}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>

              {hasAnyFilter && (
                <button type="button" onClick={clearAll} className="btn-ghost shrink-0 text-xs">
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
                  <ItemCard key={it.id} item={it} onOpen={() => setSelected(it)} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <ItemDetailModal item={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />

      <ScrollToTopButton />
    </div>
  )
}
