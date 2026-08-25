import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Upload, ArrowLeft, ArrowRight, Trash2, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'

import { subirImagenes, MIN_IMAGENES, MAX_IMAGENES } from '../../lib/imageUpload.js'

/**
 * Gestión de imágenes de un artículo (panel admin).
 *
 * - Seleccionar/"subir" hasta 3 imágenes (mín. 1, máx. 3) desde el computador.
 * - Miniaturas con vista previa local (URL.createObjectURL), quitar y reordenar.
 * - Valida mínimo (no permite guardar con 0) y máximo (bloquea al llegar a 3).
 *
 * ⚠️ Sin almacenamiento real todavía: al guardar se llama a `subirImagenes`
 * (stub en lib/imageUpload.js) que hoy devuelve previews locales. Ahí está el
 * único punto a cambiar cuando se conecte el servicio real.
 */
export default function ImageManagerModal({ open, item, onClose }) {
  const [imgs, setImgs] = useState([]) // { key, file, url }
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)
  const imgsRef = useRef([])
  useEffect(() => { imgsRef.current = imgs }, [imgs])

  // Al abrir arranca vacío; al cerrar libera los object URLs vigentes.
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImgs([])
    } else {
      imgsRef.current.forEach((i) => URL.revokeObjectURL(i.url))
    }
  }, [open])

  // Libera cualquier object URL pendiente al desmontar.
  useEffect(() => () => { imgsRef.current.forEach((i) => URL.revokeObjectURL(i.url)) }, [])

  const atMax = imgs.length >= MAX_IMAGENES

  function addFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (files.length === 0) return
    setImgs((prev) => {
      const room = MAX_IMAGENES - prev.length
      if (room <= 0) {
        toast.error(`Máximo ${MAX_IMAGENES} imágenes por artículo.`)
        return prev
      }
      const taken = files.slice(0, room)
      if (files.length > room) toast.error(`Solo se agregaron ${room}; el máximo es ${MAX_IMAGENES}.`)
      const mapped = taken.map((file) => ({ key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`, file, url: URL.createObjectURL(file) }))
      return [...prev, ...mapped]
    })
    // permite volver a elegir el mismo archivo
    if (inputRef.current) inputRef.current.value = ''
  }

  function remove(key) {
    setImgs((prev) => {
      const target = prev.find((i) => i.key === key)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((i) => i.key !== key)
    })
  }

  function move(key, dir) {
    setImgs((prev) => {
      const idx = prev.findIndex((i) => i.key === key)
      const to = idx + dir
      if (idx === -1 || to < 0 || to >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[to]] = [next[to], next[idx]]
      return next
    })
  }

  async function handleSave() {
    if (imgs.length < MIN_IMAGENES) {
      toast.error(`Agrega al menos ${MIN_IMAGENES} imagen antes de guardar.`)
      return
    }
    setSaving(true)
    try {
      // Modular: la subida real vive en lib/imageUpload.js (hoy es un stub).
      const urls = await subirImagenes(imgs.map((i) => i.file))
      // TODO: cuando exista almacenamiento real, persistir estas URLs en el
      // artículo (p. ej. PATCH item.imagenes = urls). Por ahora solo registramos.
      console.info('[imágenes] Se guardarían para', item?.id, '→', urls)
      toast.success(`${urls.length} imagen(es) listas para «${item?.nombre}». (Guardado real pendiente de conectar.)`)
      onClose()
    } catch (err) {
      toast.error(err.message || 'No se pudieron procesar las imágenes.')
    } finally {
      setSaving(false)
    }
  }

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
            <Dialog.Panel className="w-full max-w-lg rounded-2xl border border-ink-800 bg-ink-900 p-6 shadow-2xl">
              <div className="mb-1 flex items-center justify-between">
                <Dialog.Title className="font-display text-lg font-semibold">Imágenes del artículo</Dialog.Title>
                <button type="button" onClick={onClose} className="btn-ghost p-1" aria-label="Cerrar">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-4 text-sm text-ink-400">
                «{item?.nombre}» — mínimo {MIN_IMAGENES}, máximo {MAX_IMAGENES}.
              </p>

              {/* Selector de archivos */}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={atMax}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-700 py-6 text-sm text-ink-300 hover:border-brand-500/60 hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-5 w-5" />
                {atMax ? `Máximo ${MAX_IMAGENES} imágenes alcanzado` : 'Seleccionar imágenes del computador'}
              </button>

              {/* Miniaturas */}
              {imgs.length > 0 ? (
                <ul className="mt-4 grid grid-cols-3 gap-3">
                  {imgs.map((img, idx) => (
                    <li key={img.key} className="group relative overflow-hidden rounded-lg border border-ink-800 bg-ink-950">
                      <div className="aspect-square w-full">
                        <img src={img.url} alt={`Imagen ${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">{idx + 1}</span>
                      <button
                        type="button" onClick={() => remove(img.key)} aria-label={`Quitar imagen ${idx + 1}`}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button type="button" onClick={() => move(img.key, -1)} disabled={idx === 0} aria-label="Mover a la izquierda" className="rounded p-0.5 text-white disabled:opacity-30 hover:bg-white/20">
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => move(img.key, +1)} disabled={idx === imgs.length - 1} aria-label="Mover a la derecha" className="rounded p-0.5 text-white disabled:opacity-30 hover:bg-white/20">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 flex flex-col items-center gap-1 rounded-lg border border-ink-800 bg-ink-950/50 py-6 text-ink-500">
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Aún no hay imágenes seleccionadas</span>
                </div>
              )}

              <div className="mt-3 text-xs text-ink-400">
                {imgs.length}/{MAX_IMAGENES} seleccionadas
                {imgs.length < MIN_IMAGENES && <span className="text-red-400"> · se requiere al menos {MIN_IMAGENES}</span>}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
                <button type="button" onClick={handleSave} disabled={saving || imgs.length < MIN_IMAGENES} className="btn-primary">
                  {saving ? 'Guardando…' : 'Guardar imágenes'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
