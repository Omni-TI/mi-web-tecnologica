/**
 * Lógica de disponibilidad para las etiquetas (badges) del catálogo.
 *
 * ▸ UMBRAL configurable: `STOCK_THRESHOLDS.pocos`.
 *   Con `pocos: 3` → 1 rojo · 2–3 naranjo · 4+ verde.
 *
 * Reglas (en orden):
 *   - Bandera «No disponible» ON → nunca mensaje negativo:
 *       disponibles>0 → «Disponible» (verde) · =0 → «Consultar» (gris).
 *   - disponibles === 0 (sin esa bandera) → «Sin stock» (gris).
 *   - «Artículo único» ON  o  inventario de 1 sola unidad (total=1) → «Disponible».
 *   - disponibles === 1 (multi-unidad) → «¡Último disponible!» (rojo).
 *   - 2…pocos → «¡Quedan pocos!» (naranjo).
 *   - > pocos → «N disp.» (verde).
 */
export const STOCK_THRESHOLDS = {
  pocos: 3,
}

const TONE = {
  green: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40',
  orange: 'bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/40',
  red: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/40',
  gray: 'bg-ink-800 text-ink-300 ring-1 ring-ink-700',
}

/**
 * Estado visual de disponibilidad de un artículo.
 * @param {number} disponibles
 * @param {object} [opts]
 * @param {number} [opts.cantidadTotal] total de unidades (para el caso "1 sola unidad").
 * @param {boolean} [opts.articuloUnico] bandera «Artículo único».
 * @param {boolean} [opts.noDisponible] bandera «No disponible».
 * @param {{pocos:number}} [opts.thresholds]
 * @returns {{ level:string, label:string, tone:string, icon:'x'|'alert'|'check'|'info' }}
 */
export function stockStatus(disponibles, opts = {}) {
  const n = Number(disponibles) || 0
  const total = Number(opts.cantidadTotal ?? 0) || 0
  const unico = Boolean(opts.articuloUnico)
  const noDisp = Boolean(opts.noDisponible)
  const thresholds = opts.thresholds || STOCK_THRESHOLDS

  // Bandera «No disponible»: nunca mostramos mensaje negativo.
  if (noDisp) {
    return n > 0
      ? { level: 'ok', label: 'Disponible', icon: 'check', tone: TONE.green }
      : { level: 'muted', label: 'Consultar', icon: 'info', tone: TONE.gray }
  }

  if (n <= 0) {
    return { level: 'none', label: 'Sin stock', icon: 'x', tone: TONE.gray }
  }
  // «Artículo único» o inventario de 1 sola unidad → «Disponible» (sin urgencia).
  if (unico || total === 1) {
    return { level: 'ok', label: 'Disponible', icon: 'check', tone: TONE.green }
  }
  if (n === 1) {
    return { level: 'last', label: '¡Último disponible!', icon: 'alert', tone: TONE.red }
  }
  if (n <= thresholds.pocos) {
    return { level: 'low', label: '¡Quedan pocos!', icon: 'alert', tone: TONE.orange }
  }
  return { level: 'ok', label: `${n} disp.`, icon: 'check', tone: TONE.green }
}
