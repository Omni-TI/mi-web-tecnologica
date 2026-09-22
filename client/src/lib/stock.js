/**
 * Lógica de disponibilidad para las etiquetas (badges) del catálogo.
 *
 * ▸ CONFIGURACIÓN DEL UMBRAL: ajusta `STOCK_THRESHOLDS.pocos`.
 *   - 1 unidad         → ROJO  «¡Último disponible!»
 *   - 2 … `pocos`      → NARANJO «¡Quedan pocos!»
 *   - más de `pocos`   → VERDE «N disp.»
 *   - 0 unidades       → gris «En arriendo»
 *
 *   Ejemplo: con `pocos: 3` → 1 rojo · 2–3 naranjo · 4+ verde.
 *   Para que "pocos" llegue hasta 5, cambia a `pocos: 5`.
 */
export const STOCK_THRESHOLDS = {
  pocos: 3,
}

/**
 * Estado visual de disponibilidad de un artículo.
 * @param {number} disponibles  unidades disponibles.
 * @param {{pocos:number}} [thresholds]  umbral (por defecto STOCK_THRESHOLDS).
 * @returns {{ level:'none'|'last'|'low'|'ok', label:string, tone:string, icon:'x'|'alert'|'check' }}
 */
export function stockStatus(disponibles, thresholds = STOCK_THRESHOLDS) {
  const n = Number(disponibles) || 0

  if (n <= 0) {
    return {
      level: 'none',
      label: 'En arriendo',
      icon: 'x',
      tone: 'bg-ink-800 text-ink-300 ring-1 ring-ink-700',
    }
  }
  if (n === 1) {
    return {
      level: 'last',
      label: '¡Último disponible!',
      icon: 'alert',
      tone: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/40',
    }
  }
  if (n <= thresholds.pocos) {
    return {
      level: 'low',
      label: '¡Quedan pocos!',
      icon: 'alert',
      tone: 'bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/40',
    }
  }
  return {
    level: 'ok',
    label: `${n} disp.`,
    icon: 'check',
    tone: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40',
  }
}
