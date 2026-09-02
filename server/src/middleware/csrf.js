/**
 * CSRF con patrón "double-submit cookie":
 *   - En cada respuesta GET, ponemos una cookie `sr_csrf` legible por JS
 *     (no HttpOnly) con un token aleatorio.
 *   - El cliente lee la cookie y la envía en el header `X-CSRF-Token`
 *     al hacer POST/PATCH/DELETE.
 *   - El middleware compara header vs cookie en operaciones mutantes.
 *
 * Este patrón funciona porque un atacante en otro origen no puede leer
 * cookies del dominio de la API para replicar el token.
 *
 * En dev sobre HTTP-localhost el token igual se emite; en prod la cookie
 * lleva `Secure` porque compartimos config con las cookies de auth.
 */
import crypto from 'node:crypto'
import { config } from '../config/env.js'

const COOKIE = 'sr_csrf'
const HEADER = 'x-csrf-token'
const MAX_AGE_MS = 24 * 3600 * 1000

/** Genera un token cripto-seguro base64url. */
function newToken() {
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Refresca la cookie CSRF en cada respuesta si no existe o va a expirar.
 * Se monta ANTES de las rutas.
 */
export function csrfIssue(req, res, next) {
  if (!req.cookies?.[COOKIE]) {
    res.cookie(COOKIE, newToken(), {
      httpOnly: false, // el cliente debe poder leerla
      sameSite: 'strict',
      secure: config.env === 'production',
      path: '/',
      maxAge: MAX_AGE_MS,
    })
  }
  next()
}

/**
 * Verifica header X-CSRF-Token contra cookie sr_csrf.
 * Solo para métodos mutantes.
 */
export function csrfProtect(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  const cookieToken = req.cookies?.[COOKIE]
  const headerToken = req.get(HEADER)
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF token inválido o ausente.', code: 'CSRF' })
  }
  next()
}
