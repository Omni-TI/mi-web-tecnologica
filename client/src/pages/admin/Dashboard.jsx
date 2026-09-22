import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus, Loader2, Image as ImageIcon, ExternalLink, Search, PlusCircle, Eye, EyeOff, Ban } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '../../lib/api.js'
import { formatCLP } from '../../lib/format.js'
import LoadingGrid from '../../components/ui/LoadingGrid.jsx'
import ErrorPanel from '../../components/ui/ErrorPanel.jsx'
import ImageManagerModal from '../../components/admin/ImageManagerModal.jsx'
import AddItemModal from '../../components/admin/AddItemModal.jsx'

/**
 * Panel admin.
 * - Inventario leído desde Google Sheets, con búsqueda instantánea (cliente).
 * - Botones +/- en la columna "Arr." = traspaso de una unidad entre
 *   disponibles y en_arriendo (el total se mantiene). Optimista + debounce/cola,
 *   reversión ante error e indicador de "guardando", sincronizado con la hoja.
 * - "Agregar artículo": crea una fila nueva en la hoja.
 *
 * La escritura solo persiste con service account (canWrite); en modo
 * solo-lectura (CSV público) los controles quedan deshabilitados.
 */
const SAVE_DEBOUNCE_MS = 350

function norm(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [source, setSource] = useState(null)
  const [sheetUrl, setSheetUrl] = useState('')
  const [canWrite, setCanWrite] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingIds, setSavingIds] = useState(() => new Set())
  const [imagesFor, setImagesFor] = useState(null) // artículo cuyas imágenes se editan
  const [query, setQuery] = useState('')           // búsqueda de la tabla
  const [adding, setAdding] = useState(false)       // modal "Agregar artículo"
  const [creating, setCreating] = useState(false)   // guardando el nuevo artículo

  // Refs para el control de escritura (no disparan re-render).
  const itemsRef = useRef(items)
  const timers = useRef({})
  const inflight = useRef({})
  const dirty = useRef({})
  const baseline = useRef({}) // id -> { disponibles, en_arriendo } antes de la ráfaga

  useEffect(() => { itemsRef.current = items }, [items])

  const load = useCallback((signal) => {
    setLoading(true)
    return api.getItems(signal)
      .then((res) => {
        setItems(res.items ?? [])
        setSource(res.source)
        setSheetUrl(res.sheetUrl || '')
        setCanWrite(res.canWrite !== false)
        setError(null)
      })
      .catch((err) => { if (err.name !== 'AbortError') setError(err) })
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

  // Búsqueda instantánea: nombre, ID, categoría y sub-categoría.
  const filtered = useMemo(() => {
    const q = norm(query).trim()
    if (!q) return items
    return items.filter((it) =>
      norm(it.id).includes(q) ||
      norm(it.nombre).includes(q) ||
      norm(it.categoria).includes(q) ||
      norm(it.subcategoria1).includes(q) ||
      norm(it.subcategoria2).includes(q),
    )
  }, [items, query])

  function markSaving(id, on) {
    setSavingIds((prev) => {
      const n = new Set(prev)
      if (on) n.add(id); else n.delete(id)
      return n
    })
  }

  /** Envía a la hoja el estado actual (disponibles + en_arriendo) del item. */
  const flushStock = useCallback(async function flushStock(id) {
    if (inflight.current[id]) { dirty.current[id] = true; return }
    const current = itemsRef.current.find((x) => x.id === id)
    if (!current) return
    const d = current.disponibles
    const a = current.en_arriendo

    inflight.current[id] = true
    dirty.current[id] = false
    try {
      const updated = await api.setStock(id, d, a)
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...updated } : x)))
    } catch (err) {
      const base = baseline.current[id]
      if (base) {
        setItems((prev) => prev.map((x) => (x.id === id ? { ...x, disponibles: base.disponibles, en_arriendo: base.en_arriendo } : x)))
      }
      dirty.current[id] = false
      toast.error(err.message || 'No se pudo guardar el cambio en Google Sheets.')
    } finally {
      inflight.current[id] = false
      if (dirty.current[id]) {
        flushStock(id)
      } else {
        delete baseline.current[id]
        markSaving(id, false)
      }
    }
  }, [])

  /**
   * Traspaso de una unidad (botón +/- en "Arr.").
   *  delta = +1 → arrendar: disponibles−1, en_arriendo+1 (requiere disponibles > 0)
   *  delta = -1 → devolver: disponibles+1, en_arriendo−1 (requiere en_arriendo > 0)
   */
  function adjustRent(item, delta) {
    if (!canWrite) return
    const nextArr = item.en_arriendo + delta
    const nextDisp = item.disponibles - delta
    if (nextArr < 0 || nextDisp < 0) return // fuera de rango

    if (baseline.current[item.id] === undefined) {
      baseline.current[item.id] = { disponibles: item.disponibles, en_arriendo: item.en_arriendo }
    }

    // Optimista: ambas columnas y las tarjetas cambian al instante.
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, disponibles: nextDisp, en_arriendo: nextArr } : x)))
    markSaving(item.id, true)

    clearTimeout(timers.current[item.id])
    timers.current[item.id] = setTimeout(() => flushStock(item.id), SAVE_DEBOUNCE_MS)
  }

  /**
   * Alterna una bandera booleana del artículo (no_mostrar / no_disponible) y la
   * persiste vía PATCH. Optimista con reversión si la hoja rechaza el cambio.
   */
  async function toggleFlag(item, field) {
    if (!canWrite) return
    const next = !item[field]
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, [field]: next } : x)))
    markSaving(item.id, true)
    try {
      const updated = await api.updateItem(item.id, { [field]: next })
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, ...updated } : x)))
    } catch (err) {
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, [field]: !next } : x)))
      toast.error(err.message || 'No se pudo actualizar la hoja.')
    } finally {
      markSaving(item.id, false)
    }
  }

  async function handleCreate(payload) {
    setCreating(true)
    try {
      const created = await api.createItem(payload)
      setItems((prev) => [...prev, created])
      toast.success(`«${created.nombre}» creado (${created.id}).`)
      setAdding(false)
    } catch (err) {
      toast.error(err.message || 'No se pudo crear el artículo.')
    } finally {
      setCreating(false)
    }
  }

  if (error) return <ErrorPanel error={error} onRetry={() => load()} />

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold">Inventario</h2>
          {source && (
            <span className="rounded-full border border-ink-700 px-2 py-0.5 text-[11px] uppercase tracking-wider text-ink-400">
              {source === 'sheets' ? 'Google Sheets' : 'mock/local'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <button type="button" className="btn-primary text-sm" onClick={() => setAdding(true)}>
              <PlusCircle className="h-4 w-4" /> Agregar artículo
            </button>
          )}
          {sheetUrl && (
            <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
              <ExternalLink className="h-4 w-4" /> Abrir hoja de cálculo
            </a>
          )}
        </div>
      </div>

      {/* Búsqueda de la tabla (instantánea, sobre datos ya cargados) */}
      <div className="mt-3">
        <label className="relative block w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, ID, categoría o sub-categoría…"
            className="input pl-9"
            aria-label="Buscar en el inventario"
          />
        </label>
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
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Garantía</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Disp.</th>
                <th className="px-4 py-3 text-center">Arr.</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Imágenes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 bg-ink-900/30">
              {filtered.map((it) => {
                const sub = it.subcategoria1 || it.subcategoria2 || ''
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
                        <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs text-sky-300 ring-1 ring-sky-500/30">{sub}</span>
                      ) : (
                        <span className="text-ink-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {it.descripcion ? (
                        <span className="block max-w-[16rem] truncate text-xs text-ink-300" title={it.descripcion}>
                          {it.descripcion}
                        </span>
                      ) : (
                        <span className="text-ink-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {it.garantia ? (
                        <span className="block max-w-[14rem] truncate text-xs text-ink-300" title={it.garantia}>
                          {it.garantia}
                        </span>
                      ) : (
                        <span className="text-ink-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{formatCLP(it.valor_arriendo)}</td>
                    <td className="px-4 py-3 text-right">{it.cantidad_total}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-300">{it.disponibles}</td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center justify-center gap-2 transition-opacity ${saving ? 'opacity-60' : ''}`}>
                        <button
                          type="button"
                          className="btn-ghost h-7 w-7 shrink-0 justify-center p-0 disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => adjustRent(it, -1)}
                          disabled={!canWrite || it.en_arriendo <= 0}
                          aria-label={`Marcar una unidad de ${it.nombre} como devuelta`}
                          title={!canWrite ? 'Configura la service account para editar' : 'Devolver 1 (arriendo → disponible)'}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="inline-flex min-w-[2.5rem] items-center justify-center gap-1 tabular-nums text-yellow-300">
                          {saving && <Loader2 className="h-3 w-3 animate-spin text-ink-400" />}
                          {it.en_arriendo}
                        </span>
                        <button
                          type="button"
                          className="btn-ghost h-7 w-7 shrink-0 justify-center p-0 disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => adjustRent(it, +1)}
                          disabled={!canWrite || it.disponibles <= 0}
                          aria-label={`Marcar una unidad de ${it.nombre} como arrendada`}
                          title={!canWrite ? 'Configura la service account para editar' : 'Arrendar 1 (disponible → arriendo)'}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleFlag(it, 'no_mostrar')}
                          disabled={!canWrite}
                          aria-pressed={Boolean(it.no_mostrar)}
                          aria-label={`${it.no_mostrar ? 'Mostrar' : 'Ocultar'} ${it.nombre} en el catálogo`}
                          className={`btn-ghost h-7 w-7 shrink-0 justify-center p-0 disabled:cursor-not-allowed disabled:opacity-30 ${it.no_mostrar ? 'text-red-400 ring-1 ring-red-500/40' : 'text-ink-400'}`}
                          title={it.no_mostrar ? 'Oculto en el catálogo — clic para mostrar' : 'Visible — clic para ocultar (No mostrar)'}
                        >
                          {it.no_mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFlag(it, 'no_disponible')}
                          disabled={!canWrite}
                          aria-pressed={Boolean(it.no_disponible)}
                          aria-label={`Marcar ${it.nombre} como ${it.no_disponible ? 'disponible' : 'no disponible'}`}
                          className={`btn-ghost h-7 w-7 shrink-0 justify-center p-0 disabled:cursor-not-allowed disabled:opacity-30 ${it.no_disponible ? 'text-amber-400 ring-1 ring-amber-500/40' : 'text-ink-400'}`}
                          title={it.no_disponible ? 'Marcado «No disponible» — clic para habilitar' : 'Disponible — clic para marcar No disponible'}
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="btn-ghost mx-auto flex items-center gap-1 px-2 py-1 text-xs"
                        onClick={() => setImagesFor(it)}
                        aria-label={`Gestionar imágenes de ${it.nombre}`}
                        title="Gestionar imágenes"
                      >
                        <ImageIcon className="h-4 w-4" /> Gestionar
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-ink-400">
                    No hay artículos que coincidan con «{query}».
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ImageManagerModal open={Boolean(imagesFor)} item={imagesFor} onClose={() => setImagesFor(null)} />
      <AddItemModal open={adding} items={items} saving={creating} onCancel={() => setAdding(false)} onSubmit={handleCreate} />
    </>
  )
}
