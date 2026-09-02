import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Filter } from 'lucide-react'

import { api } from '../../lib/api.js'
import LoadingGrid from '../../components/ui/LoadingGrid.jsx'
import ErrorPanel from '../../components/ui/ErrorPanel.jsx'

/**
 * Página de auditoría admin.
 * Lista las últimas 200 acciones (crear/editar/eliminar) desde el backend.
 * Filtra en cliente por usuario, tipo de acción y texto en entityId.
 */
export default function Audit() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState({ user: '', action: '', q: '' })

  useEffect(() => {
    const ctrl = new AbortController()
    api.audit(ctrl.signal)
      .then((res) => { setEntries(res.entries || []); setError(null) })
      .catch((err) => { if (err.name !== 'AbortError') setError(err) })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  const filtered = useMemo(() => {
    const q = filter.q.trim().toLowerCase()
    return entries.filter((e) =>
      (!filter.user || e.user === filter.user) &&
      (!filter.action || e.action === filter.action) &&
      (!q || e.entityId?.toLowerCase().includes(q) || JSON.stringify(e.changes).toLowerCase().includes(q)),
    )
  }, [entries, filter])

  const usersList = useMemo(() => Array.from(new Set(entries.map((e) => e.user))).sort(), [entries])
  const actionsList = useMemo(() => Array.from(new Set(entries.map((e) => e.action))).sort(), [entries])

  if (error) return <ErrorPanel error={error} title="No pudimos cargar la auditoría" />

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <ClipboardList className="h-5 w-5 text-brand-500" />
        <h2 className="font-display text-lg font-semibold">Registro de auditoría</h2>
        <span className="ml-auto text-xs text-ink-400">{filtered.length} de {entries.length}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <label className="flex items-center gap-2 text-xs text-ink-400">
          <Filter className="h-3.5 w-3.5" /> Usuario
          <select
            className="input py-1 text-xs"
            value={filter.user}
            onChange={(e) => setFilter((f) => ({ ...f, user: e.target.value }))}
          >
            <option value="">Todos</option>
            {usersList.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-400">
          Acción
          <select
            className="input py-1 text-xs"
            value={filter.action}
            onChange={(e) => setFilter((f) => ({ ...f, action: e.target.value }))}
          >
            <option value="">Todas</option>
            {actionsList.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <input
          type="search"
          placeholder="Buscar id o cambios…"
          className="input flex-1 min-w-[180px] py-1 text-xs"
          value={filter.q}
          onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
        />
      </div>

      {loading ? (
        <div className="mt-3"><LoadingGrid count={3} /></div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-ink-800">
          <table className="min-w-full divide-y divide-ink-800 text-sm">
            <thead className="bg-ink-900/60 text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Usuario</th>
                <th className="px-3 py-2">Acción</th>
                <th className="px-3 py-2">Entidad</th>
                <th className="px-3 py-2">IP</th>
                <th className="px-3 py-2">Cambios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 bg-ink-900/30">
              {filtered.map((e, idx) => (
                <tr key={idx} className="align-top hover:bg-ink-800/40">
                  <td className="px-3 py-2 font-mono text-xs text-ink-400">{formatTs(e.ts)}</td>
                  <td className="px-3 py-2">{e.user}</td>
                  <td className="px-3 py-2">
                    <span className={actionBadgeClass(e.action)}>{e.action}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{e.entityId}</td>
                  <td className="px-3 py-2 text-xs text-ink-400">{e.ip}</td>
                  <td className="px-3 py-2">
                    <details>
                      <summary className="cursor-pointer text-xs text-brand-400">ver diff</summary>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-ink-950/60 p-2 text-[11px] text-ink-300">
{JSON.stringify(e.changes, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-500">Sin entradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function formatTs(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('es-CL', { hour12: false })
  } catch { return iso }
}

function actionBadgeClass(a) {
  const base = 'rounded-full px-2 py-0.5 text-[11px] font-medium ring-1'
  if (a.endsWith('.create')) return `${base} bg-emerald-500/10 text-emerald-300 ring-emerald-500/40`
  if (a.endsWith('.update')) return `${base} bg-sky-500/10 text-sky-300 ring-sky-500/40`
  if (a.endsWith('.delete')) return `${base} bg-red-500/10 text-red-300 ring-red-500/40`
  return `${base} bg-ink-700/30 text-ink-200 ring-ink-600`
}
