import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/**
 * Tema claro/oscuro.
 *
 * - Persiste en localStorage (`sr-theme`); si no hay preferencia guardada usa
 *   la del sistema. El sitio es "oscuro por defecto".
 * - Aplica/quita la clase `light` en <html> (las variables CSS de index.css
 *   invierten la rampa neutra). Un pequeño script en index.html hace lo mismo
 *   antes de pintar para evitar el destello.
 */
const STORAGE_KEY = 'sr-theme'
const ThemeContext = createContext({ theme: 'dark', toggle: () => {}, setTheme: () => {} })

function readInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
  } catch { /* noop */ }
  return 'dark'
}

function applyTheme(theme) {
  const root = document.documentElement
  // Desactiva transiciones durante el cambio para que no "parpadee".
  root.classList.add('theme-changing')
  root.classList.toggle('light', theme === 'light')
  window.setTimeout(() => root.classList.remove('theme-changing'), 60)
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* noop */ }
  }, [theme])

  const setTheme = useCallback((t) => setThemeState(t === 'light' ? 'light' : 'dark'), [])
  const toggle = useCallback(() => setThemeState((t) => (t === 'light' ? 'dark' : 'light')), [])

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext)
}
