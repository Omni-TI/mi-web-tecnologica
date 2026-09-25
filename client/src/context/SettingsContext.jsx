import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

/**
 * Configuración GLOBAL del sitio para las vistas públicas.
 *
 * Hoy expone `stockIndicatorEnabled`: si el catálogo muestra los indicadores
 * de disponibilidad. Se lee del backend (`GET /api/settings`) una sola vez y
 * queda disponible para todo el catálogo. Por defecto DESHABILITADO; si la
 * petición falla, el catálogo simplemente no muestra indicadores.
 */
const SettingsContext = createContext({
  stockIndicatorEnabled: false,
  loaded: false,
})

export function SettingsProvider({ children }) {
  const [stockIndicatorEnabled, setStockIndicatorEnabled] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    api.getSettings(ctrl.signal)
      .then((res) => setStockIndicatorEnabled(Boolean(res?.stockIndicatorEnabled)))
      .catch(() => { /* por defecto queda deshabilitado */ })
      .finally(() => setLoaded(true))
    return () => ctrl.abort()
  }, [])

  return (
    <SettingsContext.Provider value={{ stockIndicatorEnabled, loaded }}>
      {children}
    </SettingsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  return useContext(SettingsContext)
}
