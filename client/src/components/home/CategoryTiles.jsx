import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Armchair, Lamp, Layers, Sparkles, UtensilsCrossed, Sofa, Tag,
} from 'lucide-react'

/**
 * Navegación por categorías visuales (íconos circulares) bajo el Hero.
 * Cada tile enlaza al catálogo ya filtrado: /catalogo?cat=<categoría real>.
 * Las categorías se derivan dinámicamente de los datos (columna `categoria`).
 * Responsive: scroll horizontal en móvil, centrado/wrap en pantallas anchas.
 */

/** Normaliza para emparejar nombres de categoría con su ícono. */
function norm(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Elige un ícono según el nombre de la categoría (con fallback). */
function iconFor(cat) {
  const n = norm(cat)
  if (n.includes('lamp') || n.includes('ilumin') || n.includes('luz')) return Lamp
  if (n.includes('alfombra') || n.includes('textil') || n.includes('tapiz')) return Layers
  if (n.includes('cocina') || n.includes('restaur') || n.includes('vajilla')) return UtensilsCrossed
  if (n.includes('sofa') || n.includes('sillon') || n.includes('silla')) return Sofa
  if (n.includes('mueble')) return Armchair
  if (n.includes('decor')) return Sparkles
  return Tag
}

export default function CategoryTiles({ items = [] }) {
  const categories = useMemo(() => {
    const set = new Set()
    for (const it of items) {
      const c = (it.categoria || '').trim()
      if (c) set.add(c)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  if (categories.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl font-bold">Explora por categoría</h2>
      <p className="mt-1 text-sm text-ink-400">Encuentra rápido lo que buscas.</p>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 sm:flex-wrap sm:justify-start sm:overflow-visible">
        {categories.map((cat) => {
          const Icon = iconFor(cat)
          return (
            <Link
              key={cat}
              to={`/catalogo?cat=${encodeURIComponent(cat)}`}
              className="group flex min-w-[92px] shrink-0 flex-col items-center gap-2 text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-ink-700 bg-ink-800/60 text-ink-200 transition-colors group-hover:border-brand-500/60 group-hover:text-brand-400">
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              <span className="max-w-[92px] text-xs font-medium leading-tight text-ink-300 group-hover:text-brand-400">
                {cat}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
