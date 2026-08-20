import { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { AlertTriangle, Trash2 } from 'lucide-react'

/**
 * Modal de confirmación de borrado.
 * Requisito: exige escribir el NOMBRE exacto del artículo para habilitar
 * el botón "Confirmar eliminación". Diseño para evitar borrados accidentales.
 */
export default function ConfirmDeleteModal({ open, item, onCancel, onConfirm }) {
  const [typed, setTyped] = useState('')

  useEffect(() => {
    // Reset legítimo del campo al cerrar/abrir un modal distinto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setTyped('')
  }, [open])

  const disabled = !item || typed.trim() !== item.nombre.trim()

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-2xl border border-red-500/40 bg-ink-900 p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/15 p-2 text-red-400 ring-1 ring-red-500/40">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <Dialog.Title className="font-display text-lg font-semibold">
                  Eliminar artículo
                </Dialog.Title>
              </div>

              <Dialog.Description className="mt-3 text-sm text-ink-300">
                Estás a punto de eliminar{' '}
                <span className="font-semibold text-ink-50">
                  «{item?.nombre}»
                </span>. Esta acción no se puede deshacer.
              </Dialog.Description>

              <label className="mt-4 block">
                <span className="text-xs text-ink-400">
                  Escribe el nombre exacto del artículo para confirmar:
                </span>
                <input
                  className="input mt-1"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={item?.nombre}
                  autoFocus
                  aria-label="Confirmación por nombre"
                />
              </label>

              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="btn-ghost">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={disabled}
                  className="btn inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> Confirmar eliminación
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
