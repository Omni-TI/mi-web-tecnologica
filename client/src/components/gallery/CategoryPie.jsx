import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

/**
 * Gráfico de "torta" interactivo con las categorías del catálogo.
 * Al hacer click en una porción, notifica al padre para filtrar la galería.
 *
 * Colores del brand + variaciones para diferenciar hasta 8 categorías.
 */
const COLORS = ['#D97706', '#F59E0B', '#FBBF24', '#0EA5E9', '#38BDF8', '#B45309', '#F97316', '#EAB308']

export default function CategoryPie({ items, active, onSelect }) {
  const data = useMemo(() => {
    const counts = new Map()
    for (const it of items) {
      counts.set(it.categoria, (counts.get(it.categoria) || 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [items])

  if (data.length === 0) return null

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink-100">Filtrar por categoría</h2>
        <button
          type="button"
          className="text-xs text-ink-400 underline-offset-2 hover:text-brand-400 hover:underline"
          onClick={() => onSelect('Todas')}
          aria-label="Quitar filtro de categoría"
        >
          Ver todas
        </button>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={90}
              paddingAngle={2}
              onClick={(slice) => onSelect(slice?.name)}
              cursor="pointer"
            >
              {data.map((entry, idx) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[idx % COLORS.length]}
                  stroke={active === entry.name ? '#F5F5F4' : '#1C1917'}
                  strokeWidth={active === entry.name ? 2 : 1}
                  opacity={active && active !== 'Todas' && active !== entry.name ? 0.35 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#1C1917',
                border: '1px solid #44403C',
                borderRadius: 8,
                color: '#F5F5F4',
                fontSize: 12,
              }}
              formatter={(v, n) => [`${v} artículo(s)`, n]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: '#D6D3D1' }}
              iconType="circle"
              onClick={(e) => onSelect(e.value)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-[11px] text-ink-500">
        Haz clic en una porción para filtrar la galería
      </p>
    </div>
  )
}
