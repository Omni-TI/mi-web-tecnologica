import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, ChevronLeft, Check, X, Tag } from 'lucide-react'

/**
 * Selector de categoría / sub-categoría por pasos (reemplaza el gráfico de torta).
 *
 * - Nivel 1: lista de categorías (leídas dinámicamente de los datos).
 * - Nivel 2: al elegir una categoría, muestra sus sub-categorías (subcategoria1)
 *   más la opción "Ver todo en [categoría]".
 * - Breadcrumb/atrás para volver de sub-categoría a categoría y de categoría a todas.
 * - Chip del filtro activo con una X para quitarlo.
 * - Táctil: panel tipo accordion con áreas de toque amplias; en móvil ocupa
 *   todo el ancho de la columna.
 *
 * Props:
 *   items         : lista de artículos.
 *   category      : categoría activa ('Todas' = sin filtro).
 *   subcategoria  : sub-categoría activa ('' = todas dentro de la categoría).
 *   onChange({category, subcategoria}) : aplica el filtro.
 */
export default function CategoryMenu({ items, category = 'Todas', subcategoria = '', onChange }) {
  const [open, setOpen] = useState(false)
  const [drillCat, setDrillCat] = useState(null) // categoría en la que se está navegando (nivel 2)
  const rootRef = useRef(null)

  // { categoria: [subcategorias únicas ordenadas] }
  const tree = useMemo(() => {
    const map = new Map()
    for (const it of items) {
      const cat = it.categoria || 'Sin categoría'
      if (!map.has(cat)) map.set(cat, new Set())
      if (it.subcategoria1) map.get(cat).add(it.subcategoria1)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([cat, subs]) => ({
        cat,
        subs: Array.from(subs).sort((a, b) => a.localeCompare(b)),
      }))
  }, [items])

  // Cerrar al hacer clic fuera o con Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const hasFilter = (category && category !== 'Todas') || Boolean(subcategoria)
  const buttonLabel = !hasFilter
    ? 'Todas las categorías'
    : subcategoria
      ? `${category} › ${subcategoria}`
      : category

  function apply(next) {
    onChange(next)
    setOpen(false)
    setDrillCat(null)
  }

  function toggleOpen() {
    setOpen((v) => {
      const nv = !v
      // Al abrir, arranca mostrando la categoría activa (si hay) o el nivel 1.
      if (nv) setDrillCat(category && category !== 'Todas' ? category : null)
      return nv
    })
  }

  const current = drillCat ? tree.find((t) => t.cat === drillCat) : null

  return (
    <div className="card p-3" ref={rootRef}>
      <div className="mb-2 flex items-center gap-2 px-1 text-ink-100">
        <Tag className="h-4 w-4 text-brand-500" aria-hidden />
        <h2 className="text-sm font-semibold">Categoría</h2>
      </div>

      {/* Botón que abre el menú */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-ink-700 bg-ink-900/40 px-3 py-2.5 text-left text-sm text-ink-100 hover:border-brand-500/50"
      >
        <span className="truncate">{buttonLabel}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {/* Panel desplegable (accordion en la columna, full-width en móvil) */}
      {open && (
        <div className="mt-2 overflow-hidden rounded-lg border border-ink-700 bg-ink-900/60" role="menu">
          {!current ? (
            /* ── Nivel 1: categorías ── */
            <ul className="max-h-80 overflow-y-auto py-1">
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => apply({ category: 'Todas', subcategoria: '' })}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-sm text-ink-200 hover:bg-ink-800/70"
                >
                  <span>Todas las categorías</span>
                  {!hasFilter && <Check className="h-4 w-4 text-brand-400" aria-hidden />}
                </button>
              </li>
              {tree.map(({ cat, subs }) => (
                <li key={cat}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => (subs.length > 0 ? setDrillCat(cat) : apply({ category: cat, subcategoria: '' }))}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-sm text-ink-100 hover:bg-ink-800/70"
                  >
                    <span className={category === cat ? 'text-brand-300' : ''}>{cat}</span>
                    {subs.length > 0
                      ? <ChevronRight className="h-4 w-4 text-ink-400" aria-hidden />
                      : (category === cat && <Check className="h-4 w-4 text-brand-400" aria-hidden />)}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            /* ── Nivel 2: sub-categorías de `drillCat` ── */
            <div>
              <button
                type="button"
                onClick={() => setDrillCat(null)}
                className="flex w-full items-center gap-1 border-b border-ink-800 px-3 py-2.5 text-xs font-medium text-ink-400 hover:text-brand-400"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden /> Todas las categorías
              </button>
              <div className="px-3 py-2 text-xs uppercase tracking-wider text-ink-500">{current.cat}</div>
              <ul className="max-h-72 overflow-y-auto pb-1">
                <li>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => apply({ category: current.cat, subcategoria: '' })}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-sm text-ink-200 hover:bg-ink-800/70"
                  >
                    <span>Ver todo en {current.cat}</span>
                    {category === current.cat && !subcategoria && <Check className="h-4 w-4 text-brand-400" aria-hidden />}
                  </button>
                </li>
                {current.subs.map((sub) => (
                  <li key={sub}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => apply({ category: current.cat, subcategoria: sub })}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-sm text-ink-100 hover:bg-ink-800/70"
                    >
                      <span className={subcategoria === sub ? 'text-brand-300' : ''}>{sub}</span>
                      {category === current.cat && subcategoria === sub && <Check className="h-4 w-4 text-brand-400" aria-hidden />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Chip del filtro activo con X para quitarlo */}
      {hasFilter && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-600/15 px-2.5 py-1 text-xs text-brand-200 ring-1 ring-brand-500/30">
            {subcategoria ? `${category} › ${subcategoria}` : category}
            <button
              type="button"
              onClick={() => apply({ category: 'Todas', subcategoria: '' })}
              aria-label="Quitar filtro de categoría"
              className="ml-0.5 rounded-full p-0.5 hover:bg-brand-500/30"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
        </div>
      )}
    </div>
  )
}
