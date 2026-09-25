import { Fragment, useEffect, useMemo, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'

/**
 * Modal para crear un artículo nuevo (Cambio 4).
 *
 * - Categoría y sub-categoría: se puede elegir una existente (datalist) o
 *   escribir una nueva. La sub-categoría sugiere las de la categoría elegida.
 * - Al guardar: disponibles = cantidad_total y en_arriendo = 0 (el backend
 *   además genera el ID a partir del nombre).
 * - Validaciones: todos los campos obligatorios; valor y cantidad > 0.
 *
 * La creación real (nueva fila en la hoja) la hace el backend vía onSubmit.
 */
export default function AddItemModal({ open, items = [], saving, onCancel, onSubmit }) {
  const empty = { nombre: '', categoria: '', subcategoria1: '', valor_arriendo: '', cantidad_total: '', descripcion: '', garantia: '', articulo_unico: false }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(empty); setErrors({})
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Categorías existentes y sub-categorías por categoría (para los datalist).
  const cats = useMemo(
    () => Array.from(new Set(items.map((i) => i.categoria).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [items],
  )
  const subsForCat = useMemo(() => {
    const set = new Set(
      items.filter((i) => i.categoria === form.categoria).map((i) => i.subcategoria1).filter(Boolean),
    )
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items, form.categoria])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function validate() {
    const err = {}
    if (!form.nombre.trim()) err.nombre = 'Requerido'
    if (!form.categoria.trim()) err.categoria = 'Requerido'
    if (!form.subcategoria1.trim()) err.subcategoria1 = 'Requerido'
    const valor = Number(form.valor_arriendo)
    const total = Number(form.cantidad_total)
    if (!(valor > 0)) err.valor_arriendo = 'Debe ser un número mayor que 0'
    if (!Number.isInteger(total) || total <= 0) err.cantidad_total = 'Debe ser un entero mayor que 0'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  function submit(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (!validate()) return
    const total = Number(form.cantidad_total)
    onSubmit({
      nombre: form.nombre.trim(),
      categoria: form.categoria.trim(),
      subcategoria1: form.subcategoria1.trim(),
      subcategoria2: '',
      valor_arriendo: Number(form.valor_arriendo),
      cantidad_total: total,
      disponibles: total,   // inicia todo disponible
      en_arriendo: 0,       // nada arrendado
      descripcion: form.descripcion.trim(),
      garantia: form.garantia.trim(),
      articulo_unico: form.articulo_unico,
      activo: true,
    })
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
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
              <div className="mb-3 flex items-center justify-between">
                <Dialog.Title className="font-display text-lg font-semibold">Agregar artículo</Dialog.Title>
                <button type="button" onClick={onCancel} className="btn-ghost p-1" aria-label="Cerrar">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={submit} className="space-y-3">
                <datalist id="add-cats">
                  {cats.map((c) => <option key={c} value={c} />)}
                </datalist>
                <datalist id="add-subs">
                  {subsForCat.map((s) => <option key={s} value={s} />)}
                </datalist>

                <Field label="Nombre" error={errors.nombre}>
                  <input className="input" value={form.nombre} onChange={set('nombre')} autoFocus />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Categoría" error={errors.categoria}>
                    <input className="input" list="add-cats" value={form.categoria} onChange={set('categoria')}
                           placeholder="Elige o escribe una nueva" />
                  </Field>
                  <Field label="Sub-categoría" error={errors.subcategoria1}>
                    <input className="input" list="add-subs" value={form.subcategoria1} onChange={set('subcategoria1')}
                           placeholder="Elige o escribe una nueva" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Valor arriendo (CLP)" error={errors.valor_arriendo}>
                    <input type="number" min={1} step={500} className="input" value={form.valor_arriendo} onChange={set('valor_arriendo')} />
                  </Field>
                  <Field label="Cantidad total" error={errors.cantidad_total}>
                    <input type="number" min={1} step={1} className="input disabled:opacity-60" value={form.cantidad_total}
                           onChange={set('cantidad_total')} disabled={form.articulo_unico} />
                  </Field>
                </div>

                <label className="flex items-start gap-2 rounded-md border border-ink-800 bg-ink-950/40 px-3 py-2">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-brand-500"
                    checked={form.articulo_unico}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      articulo_unico: e.target.checked,
                      cantidad_total: e.target.checked ? '1' : f.cantidad_total,
                    }))}
                  />
                  <span className="text-sm text-ink-200">
                    Artículo único
                    <span className="block text-xs text-ink-400">Pieza única: fija la cantidad en 1 y muestra «Disponible» mientras haya stock.</span>
                  </span>
                </label>

                <Field label="Descripción (opcional)">
                  <textarea
                    className="input min-h-[72px] resize-y"
                    rows={3}
                    value={form.descripcion}
                    onChange={set('descripcion')}
                    placeholder="Detalle del artículo, materiales, estado, medidas…"
                  />
                </Field>
                <Field label="Garantía (opcional)">
                  <textarea
                    className="input min-h-[56px] resize-y"
                    rows={2}
                    value={form.garantia}
                    onChange={set('garantia')}
                    placeholder="Condiciones de arriendo, responsabilidad por daños…"
                  />
                </Field>

                <p className="rounded-md border border-ink-800 bg-ink-950/50 px-3 py-2 text-xs text-ink-400">
                  Al crear: <span className="text-emerald-300">disponibles = cantidad total</span> y{' '}
                  <span className="text-yellow-300">en arriendo = 0</span>. El ID se genera del nombre (ej. «Mesa comedor» → <span className="font-mono">MesaCom01</span>).
                </p>

                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
                  <button type="button" onClick={submit} disabled={saving} className="btn-primary">
                    {saving ? 'Creando…' : 'Crear artículo'}
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
