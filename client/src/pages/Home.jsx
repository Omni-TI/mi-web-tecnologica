import { Link } from 'react-router-dom'
import ItemCard from '../components/gallery/ItemCard.jsx'
import LoadingGrid from '../components/ui/LoadingGrid.jsx'
import HeroBanner from '../components/home/HeroBanner.jsx'
import CategoryTiles from '../components/home/CategoryTiles.jsx'
import { useItems } from '../hooks/useItems.js'

export default function Home() {
  const { items, loading } = useItems()
  const highlights = items.slice(0, 4)

  return (
    <>
      {/* Hero banner visual */}
      <HeroBanner />

      {/* Navegación por categorías visuales */}
      <CategoryTiles items={items} />

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
