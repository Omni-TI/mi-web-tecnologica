import { useMemo, useState } from 'react'
import { Check, X, Tag, ChevronRight } from 'lucide-react'

/**
 * Selector de categoría / sub-categoría.
 *
 * - Nivel 1: lista ESTÁTICA de categorías, siempre visible como chips (no hay
 *   nada que abrir/desplegar para verlas). Leídas dinámicamente de los datos.
 * - Nivel 2: al hacer clic en una categoría con sub-categorías, éstas se
 *   despliegan inline debajo, más la opción "Ver todo en [categoría]".
 * - Botón para cerrar/volver a sólo la lista de categorías.
 * - Chip del filtro activo con una X para quitarlo.
 * - Responsivo: los chips hacen wrap; en móvil ocupan poco alto.
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

  const current = expanded ? tree.find((t) => t.cat === expanded) : null

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2 text-ink-100">
        <Tag className="h-4 w-4 text-brand-500" aria-hidden />
        <h2 className="text-sm font-semibold">Categoría</h2>
      </div>

      {/* Lista ESTÁTICA de categorías (siempre visible) */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setExpanded(null); apply({ category: 'Todas', subcategoria: '' }) }}
          className={chipClass(!hasFilter)}
        >
          Todas
        </button>
        {tree.map((node) => {
          const active = category === node.cat
          const isOpen = expanded === node.cat
          return (
            <button
              key={node.cat}
              type="button"
              onClick={() => clickCategory(node)}
              aria-expanded={node.subs.length > 0 ? isOpen : undefined}
              className={chipClass(active, isOpen)}
            >
              {node.cat}
              {node.subs.length > 0 && (
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} aria-hidden />
              )}
            </button>
          )
        })}
      </div>

      {/* Sub-categorías desplegadas inline para la categoría elegida */}
      {current && (
        <div className="mt-3 rounded-lg border border-ink-800 bg-ink-900/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-500">{current.cat}</span>
            <button
              type="button"
              onClick={() => setExpanded(null)}
              className="text-xs text-ink-400 hover:text-brand-400"
              aria-label="Cerrar sub-categorías"
            >
              Cerrar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => apply({ category: current.cat, subcategoria: '' })}
              className={subChipClass(category === current.cat && !subcategoria)}
            >
              Ver todo en {current.cat}
            </button>
            {current.subs.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => apply({ category: current.cat, subcategoria: sub })}
                className={subChipClass(category === current.cat && subcategoria === sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

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

/** Chip de categoría (nivel 1). `active` = filtro aplicado; `open` = desplegada. */
function chipClass(active, open = false) {
  const base = 'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors'
  if (active) return `${base} bg-brand-600 text-white ring-1 ring-brand-400`
  if (open) return `${base} bg-brand-600/15 text-brand-200 ring-1 ring-brand-500/40`
  return `${base} bg-ink-800/60 text-ink-200 ring-1 ring-ink-700 hover:ring-brand-500/50 hover:text-brand-300`
}

/** Chip de sub-categoría (nivel 2). */
function subChipClass(active) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs transition-colors'
  return active
    ? `${base} bg-brand-600 text-white`
    : `${base} bg-ink-800/60 text-ink-200 ring-1 ring-ink-700 hover:ring-brand-500/50 hover:text-brand-300`
}
