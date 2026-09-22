import { Toaster } from 'sonner'
import { useTheme } from '../../hooks/useTheme.jsx'

/** Toaster (sonner) que sigue el tema activo (claro/oscuro). */
export default function ThemedToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} position="top-right" richColors />
}
