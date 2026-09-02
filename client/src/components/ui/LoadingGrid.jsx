/**
 * Placeholder de tarjetas mientras carga la galería.
 * Mantiene la altura del layout para evitar CLS.
 */
export default function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse overflow-hidden">
          <div className="aspect-[4/3] bg-ink-800" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-ink-800" />
            <div className="h-3 w-1/4 rounded bg-ink-800" />
            <div className="h-5 w-1/3 rounded bg-ink-800" />
          </div>
        </div>
      ))}
    </div>
  )
}
