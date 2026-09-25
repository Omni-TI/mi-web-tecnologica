import { useMemo } from 'react'
import Fuse from 'fuse.js'

/**
 * Búsqueda + filtrado + ordenamiento del catálogo.
 *
 * Aplica, en este orden y sin conflictos entre sí:
 *   1. Filtro por categoría y sub-categoría (subcategoria1).
 *   2. Búsqueda por texto: match exacto/contains con prioridad; si no, fuzzy (Fuse).
 *   3. Ordenamiento (relevancia | precio asc/desc | nombre A-Z/Z-A).
 *
 * Trabaja sobre datos ya cargados en memoria.
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

/** Comparadores de ordenamiento. 'relevancia' preserva el orden de entrada. */
const SORTERS = {
  relevancia: null,
  precio_asc: (a, b) => (a.valor_arriendo ?? 0) - (b.valor_arriendo ?? 0),
  precio_desc: (a, b) => (b.valor_arriendo ?? 0) - (a.valor_arriendo ?? 0),
  nombre_az: (a, b) => normalize(a.nombre).localeCompare(normalize(b.nombre)),
  nombre_za: (a, b) => normalize(b.nombre).localeCompare(normalize(a.nombre)),
}

export function useCatalogSearch(items, query, { category = 'Todas', subcategoria = '', sort = 'relevancia' } = {}) {
  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items])

  return useMemo(() => {
    const q = normalize(query)

    // 1) Filtro por categoría / sub-categoría.
    let base = items
    if (category && category !== 'Todas') {
      base = base.filter((it) => it.categoria === category)
    }
    if (subcategoria) {
      base = base.filter((it) => it.subcategoria1 === subcategoria)
    }

    // 2) Búsqueda por texto sobre el subconjunto ya filtrado.
    let out = base
    if (q) {
      const exact = base.filter(
        (it) =>
          normalize(it.nombre).includes(q) ||
          normalize(it.categoria).includes(q) ||
          normalize(it.subcategoria1).includes(q) ||
          normalize(it.subcategoria2).includes(q),
      )
      if (exact.length > 0) {
        out = exact
      } else {
        // Fuzzy respetando los filtros aplicados.
        const allowed = new Set(base)
        out = fuse.search(q).map((r) => r.item).filter((it) => allowed.has(it))
      }
    }

    // 3) Ordenamiento (copia para no mutar; 'relevancia' respeta el orden actual).
    const sorter = SORTERS[sort]
    const ordered = sorter ? [...out].sort(sorter) : out

    // 4) Los marcados "No disponible" van al final, conservando su orden relativo.
    if (ordered.some((it) => it.no_disponible)) {
      const disp = ordered.filter((it) => !it.no_disponible)
      const noDisp = ordered.filter((it) => it.no_disponible)
      return [...disp, ...noDisp]
    }
    return ordered
  }, [items, query, category, subcategoria, sort, fuse])
}
