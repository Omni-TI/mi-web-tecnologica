import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Search, ShieldCheck, Package } from 'lucide-react'
import ItemCard from '../components/gallery/ItemCard.jsx'
import LoadingGrid from '../components/ui/LoadingGrid.jsx'
import { useItems } from '../hooks/useItems.js'

export default function Home() {
  const { items, loading } = useItems()
  const highlights = items.slice(0, 4)

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink-800">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(1200px 400px at 20% -10%, rgba(217,119,6,0.35), transparent 60%), radial-gradient(800px 400px at 90% 10%, rgba(14,165,233,0.15), transparent 60%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-600/10 px-3 py-1 text-xs font-medium text-brand-300">
              <Sparkles className="h-3.5 w-3.5" /> Utilería para producciones y eventos
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
              Siete Rayos
              <span className="block text-brand-500">tu utilería, iluminada.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-ink-300">
              {/* Placeholder — el copy real se sustituirá más adelante. */}
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua ad minim veniam.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalogo" className="btn-primary">
                Explorar catálogo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contacto" className="btn-outline">
                Contactar
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-fade-up">
            {[
              { icon: Package,      title: '+200 artículos', body: 'Placeholder — inventario diverso.' },
              { icon: Search,       title: 'Búsqueda ágil',  body: 'Encuentra por nombre o similitud.' },
              { icon: Sparkles,     title: 'Colecciones',    body: 'Vintage, iluminación, mobiliario…' },
              { icon: ShieldCheck,  title: 'Confianza',      body: 'Reservas seguras y trazables.' },
            ].map((c) => (
              <div key={c.title} className="card p-4">
                <c.icon className="h-6 w-6 text-brand-500" aria-hidden />
                <h3 className="mt-3 font-display text-sm font-semibold">{c.title}</h3>
                <p className="mt-1 text-xs text-ink-400">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold">Explora Siete Rayos</h2>
        <p className="mt-1 text-sm text-ink-400">Accesos directos a las secciones del sitio.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {[
            { to: '/catalogo',      label: 'Catálogo' },
            { to: '/quienes-somos', label: 'Quiénes somos' },
            { to: '/mision',        label: 'Nuestra misión' },
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
