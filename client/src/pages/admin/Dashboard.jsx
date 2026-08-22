import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '../../lib/api.js'
import { formatCLP } from '../../lib/format.js'
import LoadingGrid from '../../components/ui/LoadingGrid.jsx'
import ErrorPanel from '../../components/ui/ErrorPanel.jsx'

/**
 * Panel admin.
 * - Inventario leído desde Google Sheets.
 * - Ajuste en vivo de unidades disponibles (+/-) sincronizado con la hoja:
 *   actualización optimista, debounce/cola por artículo, reversión ante error.
 *
 * La escritura solo persiste en modo service account (canWrite === true);
 * en modo solo-lectura (CSV público) los controles quedan deshabilitados.
 */
const SAVE_DEBOUNCE_MS = 350

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [source, setSource] = useState(null)
  const [canWrite, setCanWrite] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingIds, setSavingIds] = useState(() => new Set())

  // Refs para el control de escritura (no disparan re-render).
  const itemsRef = useRef(items)           // último estado de items (para leer en callbacks)
  const timers = useRef({})                // id -> timeout de debounce
  const inflight = useRef({})              // id -> hay una petición en curso
  const dirty = useRef({})                 // id -> llegaron más clics durante la petición
  const baseline = useRef({})              // id -> valor confirmado antes de la ráfaga (para revertir)

  useEffect(() => { itemsRef.current = items }, [items])

  const load = useCallback((signal) => {
    setLoading(true)
    return api.getItems(signal)
      .then((res) => {
        setItems(res.items ?? [])
        setSource(res.source)
        setCanWrite(res.canWrite !== false)
        setError(null)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [load])

  // Limpia timers pendientes al desmontar.
  useEffect(() => {
    const t = timers.current
    return () => { Object.values(t).forEach(clearTimeout) }
  }, [])

  const totals = useMemo(() => items.reduce((acc, it) => {
    acc.total += it.cantidad_total
    acc.disp += it.disponibles
    acc.arr += it.en_arriendo
    return acc
  }, { total: 0, disp: 0, arr: 0 }), [items])

  function markSaving(id, on) {
    setSavingIds((prev) => {
      const n = new Set(prev)
      if (on) n.add(id); else n.delete(id)
      return n
    })
  }

  /** Envía a la hoja el valor actual de disponibles del item (coalesce). */
  const flushDisp = useCallback(async function flushDisp(id) {
    if (inflight.current[id]) { dirty.current[id] = true; return } // ya hay una en curso
    const current = itemsRef.current.find((x) => x.id === id)
    if (!current) return
    const target = current.disponibles

    inflight.current[id] = true
    dirty.current[id] = false
    try {
      const updated = await api.setDisponibles(id, target)
      // Sincroniza con el valor autoritativo del servidor.
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...updated } : x)))
    } catch (err) {
      // Revierte al valor confirmado antes de la ráfaga.
      const base = baseline.current[id]
      if (base != null) {
        setItems((prev) => prev.map((x) => (x.id === id ? { ...x, disponibles: base } : x)))
      }
      dirty.current[id] = false // ya revertimos; no reintentar
      toast.error(err.message || 'No se pudo guardar el cambio en Google Sheets.')
    } finally {
      inflight.current[id] = false
      if (dirty.current[id]) {
        flushDisp(id) // llegaron más clics mientras escribíamos → manda el último valor
      } else {
        delete baseline.current[id]
        markSaving(id, false)
      }
    }
  }, [])

  /** Handler del botón +/-. Optimista + debounce por artículo. */
  function adjustDisp(item, delta) {
    if (!canWrite) return
    const ceiling = Math.max(0, item.cantidad_total - item.en_arriendo)
    const next = item.disponibles + delta
    if (next < 0 || next > ceiling) return // fuera de rango: no-op

    // Guarda el valor confirmado al inicio de la ráfaga (para poder revertir).
    if (baseline.current[item.id] === undefined) baseline.current[item.id] = item.disponibles

    // 1. Actualización optimista: el número (y las tarjetas) cambian al instante.
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, disponibles: next } : x)))
    markSaving(item.id, true)

    // 2. Debounce: clics rápidos se agrupan en una sola escritura con el valor final.
    clearTimeout(timers.current[item.id])
    timers.current[item.id] = setTimeout(() => flushDisp(item.id), SAVE_DEBOUNCE_MS)
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
      </div>

      {!loading && !canWrite && (
        <p className="mt-2 text-xs text-ink-400">
          Edición en vivo disponible al configurar la service account (ver{' '}
          <span className="font-mono">docs/GOOGLE_SHEETS_SETUP.md</span>).
        </p>
      )}

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
                <th className="px-4 py-3">Sub-categoría</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Disp.</th>
                <th className="px-4 py-3 text-right">Arr.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 bg-ink-900/30">
              {items.map((it) => {
                const sub = it.subcategoria1 || it.subcategoria2 || ''
                const ceiling = Math.max(0, it.cantidad_total - it.en_arriendo)
                const saving = savingIds.has(it.id)
                return (
                  <tr key={it.id} className="hover:bg-ink-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-ink-400">{it.id}</td>
                    <td className="px-4 py-3 font-medium text-ink-50">{it.nombre}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-600/10 px-2 py-0.5 text-xs text-brand-300 ring-1 ring-brand-500/30">
                        {it.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {sub ? (
                        <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs text-sky-300 ring-1 ring-sky-500/30">
                          {sub}
                        </span>
                      ) : (
                        <span className="text-ink-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{formatCLP(it.valor_arriendo)}</td>
                    <td className="px-4 py-3 text-right">{it.cantidad_total}</td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center justify-center gap-2 transition-opacity ${saving ? 'opacity-60' : ''}`}>
                        <button
                          type="button"
                          className="btn-ghost h-7 w-7 shrink-0 justify-center p-0 disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => adjustDisp(it, -1)}
                          disabled={!canWrite || it.disponibles <= 0}
                          aria-label={`Restar una unidad disponible de ${it.nombre}`}
                          title={!canWrite ? 'Configura la service account para editar' : 'Restar 1 disponible'}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="inline-flex min-w-[2.5rem] items-center justify-center gap-1 tabular-nums text-emerald-300">
                          {saving && <Loader2 className="h-3 w-3 animate-spin text-ink-400" />}
                          {it.disponibles}
                        </span>
                        <button
                          type="button"
                          className="btn-ghost h-7 w-7 shrink-0 justify-center p-0 disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => adjustDisp(it, +1)}
                          disabled={!canWrite || it.disponibles >= ceiling}
                          aria-label={`Sumar una unidad disponible de ${it.nombre}`}
                          title={!canWrite ? 'Configura la service account para editar' : 'Sumar 1 disponible'}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-yellow-300">{it.en_arriendo}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
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
