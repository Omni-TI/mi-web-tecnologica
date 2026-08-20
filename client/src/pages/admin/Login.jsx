import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Lock, User } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Login placeholder (Fase 1).
 * En Fase 3 hará POST /api/auth/login, recibirá cookie HttpOnly y aplicará
 * rate-limit + bloqueo por intentos fallidos.
 *
 * Por ahora acepta cualquier credencial no vacía para permitir probar la UX
 * del panel — se mostrará una advertencia visible.
 */
export default function Login() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function onSubmit(e) {
    e.preventDefault()
    if (!user || !pass) return
    setLoading(true)
    setTimeout(() => {
      toast.warning('Auth simulada. Se integrará JWT + bcrypt en Fase 3.')
      navigate('/admin')
    }, 400)
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
              value={user}
              onChange={(e) => setUser(e.target.value)}
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
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
        </label>

        <button className="btn-primary mt-6 w-full" disabled={loading}>
          {loading ? 'Verificando…' : 'Entrar'}
        </button>

        <p className="mt-4 rounded-md border border-yellow-500/40 bg-yellow-500/10 p-2 text-[11px] text-yellow-200">
          ⚠️ Autenticación aún NO implementada. En esta fase el login es simulado y
          no protege realmente el panel. Se completará en Fase 3.
        </p>
      </form>
    </div>
  )
}
