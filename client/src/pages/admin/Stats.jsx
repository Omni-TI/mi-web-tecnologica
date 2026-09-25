import { useEffect, useMemo, useState } from 'react'
import { Package, PackageCheck, Handshake, Boxes } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area,
} from 'recharts'

import { api } from '../../lib/api.js'
import LoadingGrid from '../../components/ui/LoadingGrid.jsx'
import ErrorPanel from '../../components/ui/ErrorPanel.jsx'
import { formatCLP } from '../../lib/format.js'

/**
 * Dashboard de estadísticas (Cambio 10).
 *
 * Lee el inventario (api.getItems) y la bitácora (api.audit) y muestra:
 *   1. KPIs (artículos, unidades, disponibles, en arriendo).
 *   2. Barras: disponibles vs en arriendo por categoría (2 series).
 *   3. Barras horizontales: unidades totales por categoría (un solo tono).
 *   4. Área: movimientos por día (arriendos vs devoluciones) desde la bitácora.
 *
 * Paleta validada (colorblind-safe) para tema claro y oscuro:
 *   disponibles=#16a34a · en_arriendo=#ea580c · secundario=#0284c7
 * El texto usa un gris neutro legible en ambos temas.
 */
const COLOR = { disponibles: '#16a34a', en_arriendo: '#ea580c', azul: '#0284c7' }
const TICK = '#8a847e'          // gris neutro para ejes/etiquetas (claro y oscuro)
const GRID = 'rgba(120,120,120,0.18)'
const TOOLTIP_STYLE = {
  background: '#1c1917',
  border: '1px solid #44403c',
  borderRadius: 8,
  color: '#fafaf9',
  fontSize: 12,
}

export default function Stats() {
  const [items, setItems] = useState([])
  const [movs, setMovs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([api.getItems(ctrl.signal), api.audit(ctrl.signal)])
      .then(([itemsRes, auditRes]) => {
        setItems(itemsRes.items ?? [])
        setMovs((auditRes.entries ?? []).filter((e) => e.action === 'item.stock'))
        setError(null)
      })
      .catch((err) => { if (err.name !== 'AbortError') setError(err) })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  const kpis = useMemo(() => {
    const acc = { articulos: items.length, unidades: 0, disponibles: 0, en_arriendo: 0, valor: 0 }
    for (const it of items) {
      acc.unidades += Number(it.cantidad_total) || 0
      acc.disponibles += Number(it.disponibles) || 0
      acc.en_arriendo += Number(it.en_arriendo) || 0
      acc.valor += (Number(it.valor_arriendo) || 0) * (Number(it.en_arriendo) || 0)
    }
    return acc
  }, [items])

  // Agregado por categoría (ordenado por más unidades).
  const byCategory = useMemo(() => {
    const map = new Map()
    for (const it of items) {
      const cat = it.categoria || 'Sin categoría'
      const cur = map.get(cat) || { categoria: cat, disponibles: 0, en_arriendo: 0, unidades: 0 }
      cur.disponibles += Number(it.disponibles) || 0
      cur.en_arriendo += Number(it.en_arriendo) || 0
      cur.unidades += Number(it.cantidad_total) || 0
      map.set(cat, cur)
    }
    return Array.from(map.values()).sort((a, b) => b.unidades - a.unidades)
  }, [items])

  // Movimientos por día (últimos 14 con actividad): arriendos vs devoluciones.
  const trend = useMemo(() => {
    const map = new Map()
    for (const m of movs) {
      const day = String(m.ts || '').slice(0, 10)
      if (!day) continue
      const cur = map.get(day) || { day, arriendos: 0, devoluciones: 0 }
      const unidades = Number(m.changes?.unidades) || 0
      if (m.changes?.tipo === 'arriendo') cur.arriendos += unidades
      else if (m.changes?.tipo === 'devolucion') cur.devoluciones += unidades
      map.set(day, cur)
    }
    return Array.from(map.values())
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-14)
      .map((d) => ({ ...d, label: d.day.slice(5) })) // MM-DD
  }, [movs])

  if (error) return <ErrorPanel error={error} title="No pudimos cargar las estadísticas" />
  if (loading) return <div className="mt-3"><LoadingGrid count={4} /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-lg font-semibold">Dashboard</h2>
        <span className="rounded-full border border-ink-700 px-2 py-0.5 text-[11px] uppercase tracking-wider text-ink-400">
          Resumen del inventario
        </span>
      </div>

      {/* 1) KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={<Package className="h-4 w-4" aria-hidden />} label="Artículos" value={kpis.articulos} tone="text-brand-300" />
        <Kpi icon={<Boxes className="h-4 w-4" aria-hidden />} label="Unidades totales" value={kpis.unidades} tone="text-sky-300" />
        <Kpi icon={<PackageCheck className="h-4 w-4" aria-hidden />} label="Disponibles" value={kpis.disponibles} tone="text-emerald-300" />
        <Kpi icon={<Handshake className="h-4 w-4" aria-hidden />} label="En arriendo" value={kpis.en_arriendo} tone="text-amber-300"
             hint={kpis.valor ? `${formatCLP(kpis.valor)} / arriendo` : null} />
      </div>

      {/* 2) Disponibles vs en arriendo por categoría */}
      <Card title="Disponibles vs. en arriendo por categoría">
        {byCategory.length === 0 ? (
          <Empty>No hay artículos para graficar.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -8, bottom: 8 }} barCategoryGap="22%">
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="categoria" tick={{ fill: TICK, fontSize: 12 }} tickLine={false} axisLine={{ stroke: GRID }} interval={0} angle={-12} textAnchor="end" height={54} />
              <YAxis tick={{ fill: TICK, fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
              <Tooltip cursor={{ fill: 'rgba(120,120,120,0.08)' }} contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: TICK }} />
              <Bar dataKey="disponibles" name="Disponibles" fill={COLOR.disponibles} radius={[4, 4, 0, 0]} maxBarSize={46} />
              <Bar dataKey="en_arriendo" name="En arriendo" fill={COLOR.en_arriendo} radius={[4, 4, 0, 0]} maxBarSize={46} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 3) Unidades por categoría (barras horizontales, un solo tono) */}
      <Card title="Unidades por categoría">
        {byCategory.length === 0 ? (
          <Empty>No hay artículos para graficar.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, byCategory.length * 44)}>
            <BarChart data={byCategory} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={{ fill: TICK, fontSize: 12 }} tickLine={false} axisLine={{ stroke: GRID }} allowDecimals={false} />
              <YAxis type="category" dataKey="categoria" tick={{ fill: TICK, fontSize: 12 }} tickLine={false} axisLine={false} width={104} />
              <Tooltip cursor={{ fill: 'rgba(120,120,120,0.08)' }} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="unidades" name="Unidades" fill={COLOR.azul} radius={[0, 4, 4, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 4) Movimientos por día */}
      <Card title="Movimientos por día" subtitle="Arriendos y devoluciones registrados en la bitácora">
        {trend.length === 0 ? (
          <Empty>Aún no hay movimientos registrados. Usa los botones +/− del inventario para arrendar o devolver unidades.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
              <defs>
                <linearGradient id="gradArr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR.en_arriendo} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLOR.en_arriendo} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradDev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR.azul} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLOR.azul} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: TICK, fontSize: 12 }} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis tick={{ fill: TICK, fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
              <Tooltip cursor={{ stroke: GRID }} contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: TICK }} />
              <Area type="monotone" dataKey="arriendos" name="Arriendos" stroke={COLOR.en_arriendo} strokeWidth={2} fill="url(#gradArr)" />
              <Area type="monotone" dataKey="devoluciones" name="Devoluciones" stroke={COLOR.azul} strokeWidth={2} fill="url(#gradDev)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}

function Kpi({ icon, label, value, tone = 'text-ink-100', hint }) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-4">
      <div className="flex items-center gap-2 text-ink-400">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className={`mt-2 font-display text-3xl font-bold tabular-nums ${tone}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-400">{hint}</div>}
    </div>
  )
}

function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-ink-800 bg-ink-900/40 p-4">
      <h3 className="font-display text-sm font-semibold text-ink-100">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-ink-400">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Empty({ children }) {
  return <p className="py-10 text-center text-sm text-ink-400">{children}</p>
}
