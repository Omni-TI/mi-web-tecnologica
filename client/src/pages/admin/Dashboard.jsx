import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, RotateCw } from 'lucide-react'
import { toast } from 'sonner'

import { MOCK_ITEMS, formatCLP } from '../../data/mockItems.js'
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal.jsx'

/**
 * Panel admin — Fase 1 (placeholder funcional en cliente).
 * - Tabla con todo el inventario mock.
 * - Modal de confirmación de borrado exigiendo nombre exacto.
 * - Botones editar/marcar arrendado (aún sin persistencia — Fase 3 lo conecta al backend).
 */
export default function Dashboard() {
  const [items, setItems] = useState(MOCK_ITEMS)
  const [toDelete, setToDelete] = useState(null)

  const totals = useMemo(() => {
    return items.reduce(
      (acc, it) => {
        acc.total += it.cantidad_total
        acc.disp += it.disponibles
        acc.arr += it.en_arriendo
        return acc
      },
      { total: 0, disp: 0, arr: 0 },
    )
  }, [items])

  function handleDelete() {
    if (!toDelete) return
    setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
    toast.success(`«${toDelete.nombre}» eliminado (solo en cliente — Fase 3 persistirá).`)
    setToDelete(null)
  }

  function toggleRent(item) {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== item.id) return x
        // Alterna 1 unidad entre disponible / en arriendo (validación mínima).
        if (x.disponibles > 0) {
          return { ...x, disponibles: x.disponibles - 1, en_arriendo: x.en_arriendo + 1 }
        }
        if (x.en_arriendo > 0) {
          return { ...x, disponibles: x.disponibles + 1, en_arriendo: x.en_arriendo - 1 }
        }
        return x
      }),
    )
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total unidades"   value={totals.total} />
        <StatCard label="Disponibles"      value={totals.disp} tone="ok" />
        <StatCard label="En arriendo"      value={totals.arr} tone="warn" />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Inventario</h2>
        <button
          className="btn-primary"
          onClick={() => toast.info('Formulario “nuevo artículo” — se implementa en Fase 3.')}
        >
          <Plus className="h-4 w-4" /> Nuevo artículo
        </button>
      </div>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-ink-800">
        <table className="min-w-full divide-y divide-ink-800 text-sm">
          <thead className="bg-ink-900/60 text-left text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Disp.</th>
              <th className="px-4 py-3 text-right">Arr.</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800 bg-ink-900/30">
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-ink-800/40">
                <td className="px-4 py-3 font-mono text-xs text-ink-400">{it.id}</td>
                <td className="px-4 py-3 font-medium text-ink-50">{it.nombre}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-600/10 px-2 py-0.5 text-xs text-brand-300 ring-1 ring-brand-500/30">
                    {it.categoria}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{formatCLP(it.valor_arriendo)}</td>
                <td className="px-4 py-3 text-right">{it.cantidad_total}</td>
                <td className="px-4 py-3 text-right text-emerald-300">{it.disponibles}</td>
                <td className="px-4 py-3 text-right text-yellow-300">{it.en_arriendo}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="btn-ghost px-2 py-1"
                      onClick={() => toggleRent(it)}
                      aria-label={`Alternar arriendo de ${it.nombre}`}
                      title="Marcar 1 unidad como arrendada/disponible"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                    <button
                      className="btn-ghost px-2 py-1"
                      onClick={() => toast.info(`Editar «${it.nombre}» — Fase 3.`)}
                      aria-label={`Editar ${it.nombre}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="btn-ghost px-2 py-1 text-red-400 hover:text-red-300"
                      onClick={() => setToDelete(it)}
                      aria-label={`Eliminar ${it.nombre}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={Boolean(toDelete)}
        item={toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

function StatCard({ label, value, tone }) {
  const color =
    tone === 'ok' ? 'text-emerald-300' :
    tone === 'warn' ? 'text-yellow-300' :
    'text-ink-50'
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-ink-400">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}
