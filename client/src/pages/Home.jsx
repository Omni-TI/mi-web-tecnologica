import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ItemCard from '../components/gallery/ItemCard.jsx'
import LoadingGrid from '../components/ui/LoadingGrid.jsx'
import { useItems } from '../hooks/useItems.js'

export default function Home() {
  const { items, loading } = useItems()
  const highlights = items.slice(0, 4)

  return (
    <>
      {/* HERO — vaciado intencionalmente. */}
      <section className="border-b border-ink-800">
        {/* TODO: nuevo contenido del hero, pendiente de definir */}
      </section>

      {/* Accesos rápidos */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold">Explora Siete Rayos</h2>
        <p className="mt-1 text-sm text-ink-400">Accesos directos a las secciones del sitio.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {[
            { to: '/catalogo',      label: 'Catálogo' },
            { to: '/redes',         label: 'Redes sociales' },
            { to: '/contacto',      label: 'Contacto' },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="card flex items-center justify-between px-4 py-4 text-sm hover:border-brand-500/60 hover:text-brand-400"
            >
              {l.label}
              <ArrowRight className="h-4 w-4 opacity-60" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados del catálogo */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Destacados</h2>
            <p className="mt-1 text-sm text-ink-400">
              Una muestra del catálogo. Explora todo lo disponible en la galería.
            </p>
          </div>
          <Link to="/catalogo" className="hidden text-sm text-brand-400 hover:underline sm:inline">
            Ver catálogo completo →
          </Link>
        </div>
        <div className="mt-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LoadingGrid count={4} />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((it) => (
                <ItemCard key={it.id} item={it} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
