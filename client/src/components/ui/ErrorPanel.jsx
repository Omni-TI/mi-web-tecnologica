import { AlertTriangle, RefreshCcw } from 'lucide-react'

/**
 * Panel de error accesible con reintentar.
 * Muestra el mensaje pero nunca stacks/URLs sensibles.
 */
export default function ErrorPanel({ error, onRetry, title = 'No pudimos cargar la información' }) {
  const detail = error?.message?.slice(0, 200) ?? 'Error desconocido.'
  return (
    <div className="card border-red-500/40 bg-red-500/5 p-6 text-center" role="alert">
      <AlertTriangle className="mx-auto h-8 w-8 text-red-400" aria-hidden />
      <h3 className="mt-3 font-display text-lg font-semibold text-ink-50">{title}</h3>
      <p className="mt-1 text-sm text-ink-300">{detail}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline mt-4">
          <RefreshCcw className="h-4 w-4" /> Reintentar
        </button>
      )}
    </div>
  )
}
