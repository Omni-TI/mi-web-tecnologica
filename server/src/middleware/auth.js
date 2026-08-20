import { COOKIE_ACCESS, verifyAccess } from '../services/auth.js'

/**
 * Middleware: exige un JWT de acceso válido en la cookie sr_access.
 * Adjunta req.user = { sub, username, role }.
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_ACCESS]
  if (!token) return res.status(401).json({ error: 'No autenticado.' })
  try {
    req.user = verifyAccess(token)
    return next()
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' })
  }
}
