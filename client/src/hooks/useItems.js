import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

/**
 * Carga el catálogo desde el backend con manejo de loading/error.
 * Cancela la petición si el componente se desmonta antes de resolverse.
 *
 * Este hook alimenta las vistas PÚBLICAS (Home, catálogo, tiles, menú de
 * categorías), por eso oculta los artículos marcados "No mostrar" (no_mostrar).
 * El panel admin NO usa este hook (llama a api.getItems directo) y por tanto
 * sigue viendo todos los artículos para poder gestionarlos.
 */
export function useItems() {
  const [state, setState] = useState({ items: [], source: null, loading: true, error: null })

  useEffect(() => {
    const ctrl = new AbortController()
    api.getItems(ctrl.signal)
      .then((res) => setState({
        items: (res.items ?? []).filter((it) => !it.no_mostrar),
        source: res.source,
        loading: false,
        error: null,
      }))
      .catch((err) => {
        if (err.name === 'AbortError') return
        setState({ items: [], source: null, loading: false, error: err })
      })
    return () => ctrl.abort()
  }, [])

  return state
}
