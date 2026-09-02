import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'

/**
 * Modal de creación/edición de artículo.
 * Aplica en el cliente la misma regla del backend:
 *   disponibles + en_arriendo === cantidad_total
 * (además de min/max coherentes).
 */
export default function ItemFormModal({ open, initial, onCancel, onSubmit, saving }) {
  const isEdit = Boolean(initial?.id)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      nombre: '',
      categoria: '',
      subcategoria1: '',
      subcategoria2: '',
      valor_arriendo: 0,
      cantidad_total: 1,
      disponibles: 1,
      en_arriendo: 0,
      imagen_url: '',
      activo: true,
    },
  })

  useEffect(() => {
    if (open) {
      reset(initial ? { ...initial } : {
        nombre: '',
        categoria: '',
        subcategoria1: '',
        subcategoria2: '',
        valor_arriendo: 0,
        cantidad_total: 1,
        disponibles: 1,
        en_arriendo: 0,
        imagen_url: '',
        activo: true,
      })
    }
  }, [open, initial, reset])

  const disp = Number(watch('disponibles')) || 0
  const arr = Number(watch('en_arriendo')) || 0
  const total = Number(watch('cantidad_total')) || 0
  const balanceOk = disp + arr === total

  function submit(values) {
    const payload = {
      nombre: values.nombre.trim(),
      categoria: values.categoria.trim(),
      subcategoria1: values.subcategoria1?.trim() || '',
      subcategoria2: values.subcategoria2?.trim() || '',
      valor_arriendo: Number(values.valor_arriendo),
      cantidad_total: Number(values.cantidad_total),
      disponibles: Number(values.disponibles),
      en_arriendo: Number(values.en_arriendo),
      imagen_url: values.imagen_url?.trim() || '',
      activo: Boolean(values.activo),
    }
    onSubmit(payload)
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child as={Fragment}
          enter="ease-out duration-150" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-100"   leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment}
            enter="ease-out duration-150" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"   leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-xl rounded-2xl border border-ink-800 bg-ink-900 p-6 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <Dialog.Title className="font-display text-lg font-semibold">
                  {isEdit ? 'Editar artículo' : 'Nuevo artículo'}
                </Dialog.Title>
                <button type="button" onClick={onCancel} className="btn-ghost p-1" aria-label="Cerrar">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit(submit)} className="space-y-3">
                <Field label="Nombre" error={errors.nombre?.message}>
                  <input className="input" {...register('nombre', { required: 'Requerido', maxLength: 120 })} />
                </Field>
                <Field label="Categoría" error={errors.categoria?.message}>
                  <input className="input" {...register('categoria', { required: 'Requerido', maxLength: 80 })} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Subcategoría 1">
                    <input className="input" {...register('subcategoria1', { maxLength: 80 })} />
                  </Field>
                  <Field label="Subcategoría 2">
                    <input className="input" {...register('subcategoria2', { maxLength: 80 })} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Valor arriendo (CLP)">
                    <input type="number" min={0} step={500} className="input" {...register('valor_arriendo', { valueAsNumber: true, min: 0 })} />
                  </Field>
                  <Field label="Cantidad total">
                    <input type="number" min={0} className="input" {...register('cantidad_total', { valueAsNumber: true, min: 0 })} />
                  </Field>
                  <Field label="Disponibles">
                    <input type="number" min={0} className="input" {...register('disponibles', { valueAsNumber: true, min: 0 })} />
                  </Field>
                  <Field label="En arriendo">
                    <input type="number" min={0} className="input" {...register('en_arriendo', { valueAsNumber: true, min: 0 })} />
                  </Field>
                </div>
                <Field label="Imagen (URL)">
                  <input type="url" className="input" placeholder="https://…" {...register('imagen_url')} />
                </Field>
                <label className="flex items-center gap-2 text-sm text-ink-200">
                  <input type="checkbox" {...register('activo')} className="h-4 w-4 rounded border-ink-700 bg-ink-950 text-brand-500 focus:ring-brand-500" />
                  Activo (visible en el catálogo público)
                </label>

                <div className={`rounded-md border px-3 py-2 text-xs ${
                  balanceOk
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-red-500/40 bg-red-500/10 text-red-200'
                }`}>
                  disponibles + en_arriendo = {disp + arr} · cantidad_total = {total}
                  {balanceOk ? ' ✓ balance correcto' : ' ✗ deben ser iguales'}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
                  <button type="submit" disabled={saving || !balanceOk} className="btn-primary">
                    {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear artículo'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm text-ink-200">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  )
}
