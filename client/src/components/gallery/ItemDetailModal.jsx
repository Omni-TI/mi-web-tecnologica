import { Fragment, useCallback, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import useEmblaCarousel from 'embla-carousel-react'
import { X, ChevronLeft, ChevronRight, PackageCheck, PackageX, AlertTriangle, Info, ShieldCheck } from 'lucide-react'

import { formatCLP } from '../../lib/format.js'
import { getItemImages } from '../../lib/itemImages.js'
import { stockStatus } from '../../lib/stock.js'
import { useSettings } from '../../context/SettingsContext.jsx'

const STOCK_ICON = { x: PackageX, alert: AlertTriangle, check: PackageCheck, info: Info }

/**
 * Modal de detalle del artículo.
 * - Carrusel de hasta 3 imágenes (Embla): flechas, swipe táctil e indicador (dots).
 * - Nombre, categoría, sub-categoría, disponibilidad y valor de arriendo.
 * - Cierra con X, clic afuera o Escape (Escape/afuera vía Headless UI Dialog).
 *
 * Recibe el `item` completo; las imágenes se resuelven con getItemImages(item),
 * que hoy da placeholders y mañana devolverá las URLs reales (item.imagenes).
 */
export default function ItemDetailModal({ item, open, onClose }) {
  const images = getItemImages(item)
  const { stockIndicatorEnabled } = useSettings() // preferencia global del indicador
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 })
  const [selected, setSelected] = useState(0)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i) => emblaApi && emblaApi.scrollTo(i), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => emblaApi.off('select', onSelect)
  }, [emblaApi])

  // Al reabrir con otro artículo, reinicia el carrusel a la primera imagen.
  useEffect(() => {
    if (open && emblaApi) emblaApi.scrollTo(0, true)
  }, [open, item, emblaApi])

  if (!item) return null

  const stock = stockStatus(item.disponibles, {
    cantidadTotal: item.cantidad_total,
    articuloUnico: item.articulo_unico,
    noDisponible: item.no_disponible,
  })
  const StockIcon = STOCK_ICON[stock.icon]
  const sub = [item.subcategoria1, item.subcategoria2].filter(Boolean).join(' · ')
  const multiple = images.length > 1

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}
          enter="ease-out duration-150" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment}
            enter="ease-out duration-150" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-100" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-lg overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 shadow-2xl">
              {/* Carrusel */}
              <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {images.map((src, i) => (
                      <div className="min-w-0 flex-[0_0_100%]" key={i}>
                        <div className="aspect-[4/3] w-full bg-ink-950">
                          <img src={src} alt={`${item.nombre} — imagen ${i + 1}`} className="h-full w-full object-cover" draggable={false} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón cerrar */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Flechas (solo si hay más de una imagen) */}
                {multiple && (
                  <>
                    <button
                      type="button" onClick={scrollPrev} aria-label="Imagen anterior"
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button" onClick={scrollNext} aria-label="Imagen siguiente"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Indicador de posición (dots) */}
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => scrollTo(i)}
                          aria-label={`Ir a la imagen ${i + 1}`}
                          aria-current={selected === i}
                          className={`h-2 rounded-full transition-all ${selected === i ? 'w-5 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Detalle */}
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <Dialog.Title className="font-display text-xl font-bold leading-tight text-ink-50">
                    {item.nombre}
                  </Dialog.Title>
                  {stockIndicatorEnabled && (
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${stock.tone}`}
                    >
                      <StockIcon className="h-3.5 w-3.5" aria-hidden />
                      {stock.label}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand-600/10 px-2.5 py-1 text-xs text-brand-300 ring-1 ring-brand-500/30">
                    {item.categoria}
                  </span>
                  {sub && (
                    <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs text-sky-300 ring-1 ring-sky-500/30">
                      {sub}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-bold text-ink-50">{formatCLP(item.valor_arriendo)}</span>
                  <span className="text-sm text-ink-400">+ IVA</span>
                </div>

                {item.descripcion && (
                  <div className="pt-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">Descripción</h3>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-200">{item.descripcion}</p>
                  </div>
                )}

                {item.garantia && (
                  <div className="rounded-lg border border-brand-500/20 bg-brand-600/5 p-3">
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-300">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Garantía
                    </h3>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-200">{item.garantia}</p>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
