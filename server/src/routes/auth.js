import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'

import { config } from '../config/env.js'
import { validateBody } from '../middleware/validate.js'
import { requireAuth } from '../middleware/auth.js'
import {
  authenticate,
  issueTokens,
  cookieOptions,
  verifyRefresh,
  COOKIE_ACCESS,
  COOKIE_REFRESH,
} from '../services/auth.js'
import { findUserByUsername } from '../services/users.js'

const router = Router()

// Ventana de rate limit por IP para login — capa complementaria al bloqueo
// por usuario (auth.js) que sí cuenta intentos por username.
const loginLimiter = rateLimit({
  windowMs: config.rateLimit.loginWindowMs,
  max: config.rateLimit.loginMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Vuelve a intentar más tarde.' },
})

const LoginBody = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(200),
})

// TTL en ms (usados para maxAge de cookie — el JWT ya tiene su propio exp).
const ACCESS_MAX_AGE = 15 * 60 * 1000
const REFRESH_MAX_AGE = 7 * 24 * 3600 * 1000

router.post('/login', loginLimiter, validateBody(LoginBody), async (req, res, next) => {
  try {
    const user = await authenticate(req.body.username, req.body.password)
    const { access, refresh } = issueTokens(user)
    res.cookie(COOKIE_ACCESS, access, cookieOptions({ maxAgeMs: ACCESS_MAX_AGE }))
    res.cookie(COOKIE_REFRESH, refresh, cookieOptions({ maxAgeMs: REFRESH_MAX_AGE, refresh: true }))
    res.json({ user: { username: user.username, role: user.role } })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message, code: err.code })
    next(err)
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_ACCESS, { path: '/' })
  res.clearCookie(COOKIE_REFRESH, { path: '/api/auth' })
  res.json({ ok: true })
})

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.[COOKIE_REFRESH]
  if (!token) return res.status(401).json({ error: 'No refresh token.' })
  try {
    const payload = verifyRefresh(token)
    // Recargamos el user desde el store para reflejar cambios de rol/bloqueo.
    const user = await findUserByUsername(payload.username || '')
      || { id: payload.sub, username: payload.username, role: 'admin' }
    const { access, refresh } = issueTokens(user)
    res.cookie(COOKIE_ACCESS, access, cookieOptions({ maxAgeMs: ACCESS_MAX_AGE }))
    res.cookie(COOKIE_REFRESH, refresh, cookieOptions({ maxAgeMs: REFRESH_MAX_AGE, refresh: true }))
    res.json({ ok: true })
  } catch {
    res.status(401).json({ error: 'Refresh token inválido o expirado.' })
  }
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: { username: req.user.username, role: req.user.role } })
})

export default router
