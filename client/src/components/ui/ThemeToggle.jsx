import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme.jsx'

/**
 * Botón para alternar tema claro/oscuro.
 * Muestra el ícono del tema al que se cambiará.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'
  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-md p-2 text-ink-200 transition-colors hover:bg-ink-800 hover:text-brand-400 ${className}`}
      aria-label={isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
      title={isLight ? 'Tema oscuro' : 'Tema claro'}
    >
      {isLight ? <Moon className="h-5 w-5" aria-hidden /> : <Sun className="h-5 w-5" aria-hidden />}
    </button>
  )
}
