import { Clapperboard, Camera, Building2, Palette, Megaphone, Film } from 'lucide-react'

/**
 * Franja de "social proof": logotipos de productoras / agencias / marcas.
 *
 * ▸ PLACEHOLDERS por ahora: wordmarks genéricos en escala de grises que pasan
 *   a color en hover. Para usar tus logos reales, reemplaza este arreglo por
 *   <img> apuntando a `client/public/logos/<archivo>.svg` (o pásalos como prop).
 */
const LOGOS = [
  { name: 'Estudio Norte', Icon: Clapperboard, color: '#F59E0B' },
  { name: 'Lente Vivo', Icon: Camera, color: '#38BDF8' },
  { name: 'Casa Austral', Icon: Building2, color: '#34D399' },
  { name: 'Taller Croma', Icon: Palette, color: '#F472B6' },
  { name: 'Vocal Media', Icon: Megaphone, color: '#A78BFA' },
  { name: 'Cine Raíz', Icon: Film, color: '#FB7185' },
]

export default function SocialProof() {
  return (
    <section className="border-t border-ink-800 bg-ink-950/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-2xl font-bold">Confían en nosotros</h2>
        <p className="mt-1 text-center text-sm text-ink-400">
          Marcas, productoras y agencias que han arrendado con Siete Rayos.
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {LOGOS.map((logo) => {
            const Icon = logo.Icon
            return (
              <li
                key={logo.name}
                className="opacity-60 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
              >
                <span
                  className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
                  style={{ color: logo.color }}
                  title={logo.name}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                  {logo.name}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
