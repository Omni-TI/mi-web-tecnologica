import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

/**
 * Carga el catálogo desde el backend con manejo de loading/error.
 * Cancela la petición si el componente se desmonta antes de resolverse.
 */
export function useItems() {
  const [state, setState] = useState({ items: [], source: null, loading: true, error: null })

  useEffect(() => {
    const ctrl = new AbortController()
    api.getItems(ctrl.signal)
      .then((res) => setState({ items: res.items ?? [], source: res.source, loading: false, error: null }))
      .catch((err) => {
        if (err.name === 'AbortError') return
        setState({ items: [], source: null, loading: false, error: err })
      })
    return () => ctrl.abort()
  }, [])

  return state
}
