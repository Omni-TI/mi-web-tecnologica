import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <Zap className="h-12 w-12 text-brand-500" aria-hidden />
      <h1 className="mt-4 font-display text-4xl font-bold">404</h1>
      <p className="mt-2 text-ink-300">Esa página no existe en el catálogo.</p>
      <Link to="/" className="btn-primary mt-6">Volver al inicio</Link>
    </div>
  )
}
