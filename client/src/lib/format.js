/** Formatea un número CLP (por ejemplo: 25000 → "$25.000"). */
export function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}
