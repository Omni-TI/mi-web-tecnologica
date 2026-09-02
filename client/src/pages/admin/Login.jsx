import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Zap, Lock, User } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../hooks/useAuth.jsx'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/admin'

  async function onSubmit(e) {
    e.preventDefault()
    if (!username || !password) return
    setLoading(true)
    try {
      await login(username, password)
      toast.success('Sesión iniciada.')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const detail =
        err.status === 429 ? 'Demasiados intentos. Espera y vuelve a intentar.'
        : err.status === 423 ? 'Cuenta temporalmente bloqueada por intentos fallidos.'
        : 'Credenciales inválidas.'
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-4">
      <form
        onSubmit={onSubmit}
        className="card w-full max-w-sm p-6"
        aria-label="Formulario de inicio de sesión"
      >
        <div className="flex items-center gap-2 font-display text-lg font-bold text-brand-500">
          <Zap className="h-5 w-5 fill-brand-500" />
          <span>Siete<span className="text-ink-50">Rayos</span> · Admin</span>
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-1 text-xs text-ink-400">
          Acceso restringido para administradores del inventario.
        </p>

        <label className="mt-6 block">
          <span className="text-sm text-ink-200">Usuario</span>
          <div className="relative mt-1">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              required
              autoComplete="username"
              className="input pl-9"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </label>
        <label className="mt-3 block">
          <span className="text-sm text-ink-200">Contraseña</span>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              required
              type="password"
              autoComplete="current-password"
              className="input pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </label>

        <button className="btn-primary mt-6 w-full" disabled={loading}>
          {loading ? 'Verificando…' : 'Entrar'}
        </button>

        <p className="mt-4 text-[11px] text-ink-500">
          Para crear el primer admin ejecuta en el servidor:
          <code className="mt-1 block rounded bg-ink-950/60 px-2 py-1 font-mono text-[11px] text-brand-300">
            npm run admin:create -- --user admin --password &lt;secreta&gt;
          </code>
        </p>
      </form>
    </div>
  )
}
