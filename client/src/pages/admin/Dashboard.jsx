import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, RotateCw } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '../../lib/api.js'
import { formatCLP } from '../../lib/format.js'
import LoadingGrid from '../../components/ui/LoadingGrid.jsx'
import ErrorPanel from '../../components/ui/ErrorPanel.jsx'
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal.jsx'
import ItemFormModal from '../../components/admin/ItemFormModal.jsx'

/**
 * Panel admin — Fase 3.
 * CRUD real contra /api/items. Cada acción muestra toast y actualiza estado local.
 */
export default function Dashboard() {
  const [items, setItems] = useState([])
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [toEdit, setToEdit] = useState(null)         // { ...item } o null
  const [creating, setCreating] = useState(false)    // boolean → abre modal en modo crear
  const [saving, setSaving] = useState(false)

  const load = useCallback((signal) => {
    setLoading(true)
    return api.getItems(signal)
      .then((res) => {
        setItems(res.items ?? [])
        setSource(res.source)
        setError(null)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    // `load` es un fetch async que setState en el `.then`. La regla nueva
    // se activa porque técnicamente estamos disparando actualizaciones
    // desde un efecto; es el uso legítimo (carga inicial de datos externos).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [load])

  const totals = useMemo(() => items.reduce((acc, it) => {
    acc.total += it.cantidad_total
    acc.disp += it.disponibles
    acc.arr += it.en_arriendo
    return acc
  }, { total: 0, disp: 0, arr: 0 }), [items])

  async function handleDelete() {
    if (!toDelete) return
    try {
      await api.deleteItem(toDelete.id)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      toast.success(`«${toDelete.nombre}» eliminado.`)
      setToDelete(null)
    } catch (err) {
      toast.error(err.message || 'No se pudo eliminar.')
    }
  }

  async function handleSubmit(payload) {
    setSaving(true)
    try {
      if (toEdit) {
        const updated = await api.updateItem(toEdit.id, payload)
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
        toast.success(`«${updated.nombre}» actualizado.`)
      } else {
        const created = await api.createItem(payload)
        setItems((prev) => [...prev, created])
        toast.success(`«${created.nombre}» creado.`)
      }
      setToEdit(null)
      setCreating(false)
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleRent(item) {
    if (item.disponibles === 0 && item.en_arriendo === 0) return
    const patch = item.disponibles > 0
      ? { disponibles: item.disponibles - 1, en_arriendo: item.en_arriendo + 1 }
      : { disponibles: item.disponibles + 1, en_arriendo: item.en_arriendo - 1 }
    try {
      const updated = await api.updateItem(item.id, patch)
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
    } catch (err) {
      toast.error(err.message || 'No se pudo actualizar.')
    }
  }

  if (error) return <ErrorPanel error={error} onRetry={() => load()} />

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total unidades"   value={loading ? '…' : totals.total} />
        <StatCard label="Disponibles"      value={loading ? '…' : totals.disp} tone="ok" />
        <StatCard label="En arriendo"      value={loading ? '…' : totals.arr} tone="warn" />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold">Inventario</h2>
          {source && (
            <span className="rounded-full border border-ink-700 px-2 py-0.5 text-[11px] uppercase tracking-wider text-ink-400">
              {source === 'sheets' ? 'Google Sheets' : 'mock/local'}
            </span>
          )}
        </div>
        <button className="btn-primary" onClick={() => { setCreating(true); setToEdit(null) }}>
          <Plus className="h-4 w-4" /> Nuevo artículo
        </button>
      </div>

      {loading ? (
        <div className="mt-3"><LoadingGrid count={3} /></div>
      ) : (
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
                      <button className="btn-ghost px-2 py-1" onClick={() => toggleRent(it)}
                              aria-label={`Alternar arriendo de ${it.nombre}`}
                              title="Marcar 1 unidad como arrendada/disponible">
                        <RotateCw className="h-4 w-4" />
                      </button>
                      <button className="btn-ghost px-2 py-1" onClick={() => { setToEdit(it); setCreating(false) }}
                              aria-label={`Editar ${it.nombre}`}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="btn-ghost px-2 py-1 text-red-400 hover:text-red-300"
                              onClick={() => setToDelete(it)}
                              aria-label={`Eliminar ${it.nombre}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ItemFormModal
        open={creating || Boolean(toEdit)}
        initial={toEdit}
        saving={saving}
        onCancel={() => { setToEdit(null); setCreating(false) }}
        onSubmit={handleSubmit}
      />

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
  const color = tone === 'ok' ? 'text-emerald-300' : tone === 'warn' ? 'text-yellow-300' : 'text-ink-50'
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-ink-400">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}
