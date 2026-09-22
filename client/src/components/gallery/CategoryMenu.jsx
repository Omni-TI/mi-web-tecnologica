import { useMemo, useState } from 'react'
import { X, Tag, ChevronDown } from 'lucide-react'

/**
 * Selector de categoría / sub-categoría (vista de LISTA vertical).
 *
 * - Las categorías se muestran como una lista vertical, una debajo de otra,
 *   leídas dinámicamente de los datos (columna `categoria`).
 * - Al seleccionar una categoría con sub-categorías, éstas se despliegan
 *   inline debajo de esa fila (acordeón), mostrando cada `subcategoria1`
 *   correspondiente más la opción "Ver todo en [categoría]".
 * - Una categoría sin sub-categorías filtra directamente al hacer clic.
 * - Chip del filtro activo con una X para quitarlo.
 *
 * Props:
 *   items         : lista de artículos.
 *   category      : categoría activa ('Todas' = sin filtro).
 *   subcategoria  : sub-categoría activa ('' = todas dentro de la categoría).
 *   onChange({category, subcategoria}) : aplica el filtro.
 */
export default function CategoryMenu({ items, category = 'Todas', subcategoria = '', onChange }) {
  // Categoría cuyas sub-categorías están desplegadas inline (null = ninguna).
  const [expanded, setExpanded] = useState(category && category !== 'Todas' ? category : null)

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
      .map(([cat, subs]) => ({ cat, subs: Array.from(subs).sort((a, b) => a.localeCompare(b)) }))
  }, [items])

  const hasFilter = (category && category !== 'Todas') || Boolean(subcategoria)

  function apply(next) {
    onChange(next)
  }

  function clickCategory(node) {
    if (node.subs.length > 0) {
      // Con sub-categorías: despliega/oculta el panel inline (no filtra aún).
      setExpanded((cur) => (cur === node.cat ? null : node.cat))
    } else {
      // Sin sub-categorías: filtra directo por la categoría completa.
      setExpanded(null)
      apply({ category: node.cat, subcategoria: '' })
    }
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2 text-ink-100">
        <Tag className="h-4 w-4 text-brand-500" aria-hidden />
        <h2 className="text-sm font-semibold">Categoría</h2>
      </div>

      {/* Lista vertical de categorías */}
      <ul className="flex flex-col gap-1">
        {/* Todas (reset) */}
        <li>
          <button
            type="button"
            onClick={() => { setExpanded(null); apply({ category: 'Todas', subcategoria: '' }) }}
            className={rowClass(!hasFilter)}
          >
            <span>Todas</span>
          </button>
        </li>

        {tree.map((node) => {
          const active = category === node.cat
          const isOpen = expanded === node.cat
          const withSubs = node.subs.length > 0
          return (
            <li key={node.cat}>
              <button
                type="button"
                onClick={() => clickCategory(node)}
                aria-expanded={withSubs ? isOpen : undefined}
                className={rowClass(active && !subcategoria, isOpen)}
              >
                <span className="truncate">{node.cat}</span>
                {withSubs && (
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                )}
              </button>

              {/* Sub-categorías desplegadas inline bajo la categoría */}
              {withSubs && isOpen && (
                <ul className="ml-3 mt-1 flex flex-col gap-1 border-l border-ink-800 pl-3">
                  <li>
                    <button
                      type="button"
                      onClick={() => apply({ category: node.cat, subcategoria: '' })}
                      className={subRowClass(active && !subcategoria)}
                    >
                      Ver todo en {node.cat}
                    </button>
                  </li>
                  {node.subs.map((sub) => (
                    <li key={sub}>
                      <button
                        type="button"
                        onClick={() => apply({ category: node.cat, subcategoria: sub })}
                        className={subRowClass(active && subcategoria === sub)}
                      >
                        {sub}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      {/* Chip del filtro activo con X para quitarlo */}
      {hasFilter && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-800 pt-3">
          <span className="text-xs text-ink-500">Filtro:</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-600/15 px-2.5 py-1 text-xs text-brand-200 ring-1 ring-brand-500/30">
            {subcategoria ? `${category} › ${subcategoria}` : category}
            <button
              type="button"
              onClick={() => { setExpanded(null); apply({ category: 'Todas', subcategoria: '' }) }}
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

/** Fila de categoría (nivel 1). `active` = filtro aplicado; `open` = desplegada. */
function rowClass(active, open = false) {
  const base = 'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors'
  if (active) return `${base} bg-brand-600 text-white ring-1 ring-brand-400`
  if (open) return `${base} bg-brand-600/15 text-brand-200 ring-1 ring-brand-500/40`
  return `${base} text-ink-200 hover:bg-ink-800/60 hover:text-brand-300`
}

/** Fila de sub-categoría (nivel 2). */
function subRowClass(active) {
  const base = 'block w-full rounded-md px-3 py-1.5 text-left text-xs transition-colors'
  return active
    ? `${base} bg-brand-600 text-white`
    : `${base} text-ink-300 hover:bg-ink-800/60 hover:text-brand-300`
}
