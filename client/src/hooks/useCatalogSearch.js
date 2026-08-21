import { useMemo } from 'react'
import Fuse from 'fuse.js'

/**
 * Búsqueda del catálogo:
 *   - Match exacto (case/acento-insensible) tiene prioridad.
 *   - Si no, fuzzy con Fuse.js.
 *   - Además filtra por categoría (si se pasa).
 *
 * Diseñado para trabajar sobre datos ya cargados en memoria (una vez el
 * frontend recibe el catálogo del backend, cachearlo aquí es barato).
 */
const FUSE_OPTIONS = {
  keys: [
    { name: 'nombre',        weight: 0.6 },
    { name: 'categoria',     weight: 0.2 },
    { name: 'subcategoria1', weight: 0.1 },
    { name: 'subcategoria2', weight: 0.1 },
  ],
  threshold: 0.35, // 0 = exacto, 1 = todo pasa
  ignoreLocation: true,
  includeScore: false,
  minMatchCharLength: 2,
}

function normalize(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function useCatalogSearch(items, query, category) {
  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items])

  return useMemo(() => {
    const q = normalize(query)
    let out = items

    if (category && category !== 'Todas') {
      out = out.filter((it) => it.categoria === category)
    }

    if (!q) return out

    // 1) Exacto o "contains" tiene prioridad absoluta.
    const exact = out.filter(
      (it) =>
        normalize(it.nombre).includes(q) ||
        normalize(it.categoria).includes(q) ||
        normalize(it.subcategoria1).includes(q) ||
        normalize(it.subcategoria2).includes(q),
    )
    if (exact.length > 0) return exact

    // 2) Fallback fuzzy respetando el filtro de categoría.
    const fuzzy = fuse.search(q).map((r) => r.item)
    if (category && category !== 'Todas') {
      return fuzzy.filter((it) => it.categoria === category)
    }
    return fuzzy
  }, [items, query, category, fuse])
}
