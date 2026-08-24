import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * Botón flotante circular "volver arriba".
 * - Aparece solo tras scrollear más de `threshold` px desde el tope.
 * - Se oculta con transición suave (opacidad) al volver arriba.
 * - Al hacer clic, scroll suave hasta el inicio.
 *
 * Se monta solo donde se necesita (ver Gallery); no es global.
 */
export default function ScrollToTopButton({ threshold = 350 }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll() // estado inicial correcto si se monta ya scrolleado
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Volver arriba"
      title="Volver arriba"
      className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full
        bg-brand-600 text-white shadow-lg ring-1 ring-brand-400/40 transition-all duration-300
        hover:bg-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300
        ${visible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'}`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  )
}
