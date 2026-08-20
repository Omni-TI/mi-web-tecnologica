/**
 * Siete Rayos — servidor Express.
 *
 * Fase 3:
 *   ✅ GET  /api/health
 *   ✅ GET  /api/items                (público)
 *   ✅ GET  /api/items/categories     (público)
 *   ✅ POST /api/auth/login           (rate-limited, bcrypt + JWT en cookies HttpOnly)
 *   ✅ POST /api/auth/logout
 *   ✅ POST /api/auth/refresh
 *   ✅ GET  /api/auth/me
 *   ✅ POST /api/items                (admin, valida y auditea)
 *   ✅ PATCH /api/items/:id           (admin)
 *   ✅ DELETE /api/items/:id          (admin)
 */
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { config } from './config/env.js'
import itemsRouter from './routes/items.js'
import authRouter from './routes/auth.js'
import { usersBackend } from './services/users.js'

const app = express()

// Necesario para que req.ip refleje el cliente detrás de un proxy (Railway, etc.)
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: config.clientOrigin, credentials: true }))
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: config.env,
    sheetsEnabled: config.sheetsEnabled,
    usersBackend: usersBackend(),
    ts: new Date().toISOString(),
  })
})

app.use('/api/auth', authRouter)
app.use('/api/items', itemsRouter)

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
