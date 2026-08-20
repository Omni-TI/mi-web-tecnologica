/**
 * Siete Rayos — servidor Express (Fase 4).
 *
 * Endpoints públicos:
 *   GET  /api/health
 *   GET  /api/items
 *   GET  /api/items/categories
 *
 * Auth:
 *   POST /api/auth/login    (rate-limited)
 *   POST /api/auth/logout
 *   POST /api/auth/refresh
 *   GET  /api/auth/me
 *
 * Admin (requireAuth + CSRF):
 *   POST/PATCH/DELETE /api/items
 *   GET  /api/audit
 */
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { config } from './config/env.js'
import { securityHeaders } from './middleware/security.js'
import { csrfIssue, csrfProtect } from './middleware/csrf.js'

import itemsRouter from './routes/items.js'
import authRouter from './routes/auth.js'
import auditRouter from './routes/audit.js'
import { usersBackend } from './services/users.js'

const app = express()

// Necesario para que req.ip refleje el cliente detrás de un proxy (Railway).
app.set('trust proxy', 1)
app.disable('x-powered-by')

// Helmet: CSP estricta + HSTS + defaults en producción; defaults en dev.
app.use(securityHeaders())

app.use(cors({ origin: config.clientOrigin, credentials: true }))
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

// Emite cookie CSRF (double-submit) para que el cliente la lea y la envíe
// en el header X-CSRF-Token en operaciones mutantes.
app.use(csrfIssue)

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: config.env,
    sheetsEnabled: config.sheetsEnabled,
    usersBackend: usersBackend(),
    ts: new Date().toISOString(),
  })
})

// Auth: el LOGIN requiere CSRF también (protege contra login-CSRF).
app.use('/api/auth', csrfProtect, authRouter)

// Items: GET públicos sin csrf; mutaciones dentro pasan por requireAuth + csrfProtect.
app.use('/api/items', csrfProtect, itemsRouter)

// Auditoría (solo admin).
app.use('/api/audit', csrfProtect, auditRouter)

app.use((_req, res) => res.status(404).json({ error: 'Not Found' }))

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal Server Error' })
})

app.listen(config.port, () => {
  console.log(
    `[siete-rayos] API :${config.port} ` +
    `(env=${config.env}, sheets=${config.sheetsEnabled ? 'ON' : 'MOCK'}, ` +
    `users=${usersBackend()}, client=${config.clientOrigin})`,
  )
})
