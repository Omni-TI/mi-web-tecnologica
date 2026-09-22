import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * Hero Banner del home.
 *
 * Fondo: imagen (placeholder) + degradado oscuro para que el texto sea legible.
 * ▸ Para usar tu foto real, deja el archivo en `client/public/hero.jpg`
 *   (horizontal, alta calidad, tipo set de filmación con utilería).
 *   Si el archivo no existe, se ve el degradado de fondo igualmente.
 */
export default function HeroBanner() {
  return (
    <section className="relative isolate overflow-hidden border-b border-ink-800">
      {/* Fondo: foto (placeholder /hero.jpg) + degradado para legibilidad */}
      <div
        className="absolute inset-0 -z-10 bg-ink-950 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(12,10,9,0.94) 0%, rgba(12,10,9,0.70) 45%, rgba(12,10,9,0.40) 100%), url('/hero.jpg')",
        }}
        aria-hidden
      />
      {/* Resplandor cálido decorativo (se ve aunque no haya foto) */}
      <div
        className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto flex min-h-[420px] max-w-7xl flex-col justify-center px-4 py-16 sm:min-h-[480px] sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
          Utilería &amp; decoración para producciones
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-ink-50 sm:text-5xl lg:text-6xl">
          Dale carácter a cada escena
        </h1>
        <p className="mt-4 max-w-xl text-base text-ink-200 sm:text-lg">
          Arriendo de mobiliario, iluminación y decoración para cine, publicidad,
          eventos y proyectos creativos. Encuentra la pieza exacta que tu escena necesita.
        </p>
        <div className="mt-8">
          <Link to="/catalogo" className="btn-primary px-6 py-3 text-base">
            Explorar catálogo
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
