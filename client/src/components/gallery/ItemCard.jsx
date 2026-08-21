import { Zap, PackageCheck, PackageX } from 'lucide-react'
import { formatCLP } from '../../lib/format.js'

/**
 * Tarjeta de artículo para la galería pública.
 * Muestra imagen (placeholder si no hay), nombre, categoría, valor y disponibilidad.
 */
export default function ItemCard({ item }) {
  const disponible = item.disponibles > 0
  return (
    <article
      className="card group animate-fade-up overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:border-brand-500/60 hover:shadow-glow"
      aria-label={`${item.nombre} — categoría ${item.categoria}`}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-ink-800 to-ink-950 text-ink-600">
        {item.imagen_url ? (
          <img
            src={item.imagen_url}
            alt={item.nombre}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <Zap className="h-12 w-12" aria-hidden />
        )}
        <span
          className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
            disponible
              ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40'
              : 'bg-red-500/15 text-red-300 ring-1 ring-red-500/40'
          }`}
        >
          {disponible ? <PackageCheck className="h-3.5 w-3.5" /> : <PackageX className="h-3.5 w-3.5" />}
          {disponible ? `${item.disponibles} disp.` : 'En arriendo'}
        </span>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-tight text-ink-50">
            {item.nombre}
          </h3>
        </div>
        <p className="text-xs uppercase tracking-wider text-brand-400">{item.categoria}</p>
        {(item.subcategoria1 || item.subcategoria2) && (
          <div className="flex flex-wrap gap-1">
            {[item.subcategoria1, item.subcategoria2].filter(Boolean).map((s) => (
              <span key={s} className="rounded-full bg-ink-800 px-2 py-0.5 text-[11px] text-ink-300">
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-baseline justify-between pt-2">
          <span className="text-lg font-bold text-ink-50">{formatCLP(item.valor_arriendo)}</span>
          <span className="text-xs text-ink-400">/ arriendo</span>
        </div>
      </div>
    </article>
  )
}
