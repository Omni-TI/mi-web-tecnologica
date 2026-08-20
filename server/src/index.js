/**
 * Siete Rayos — servidor Express.
 *
 * Fase 2:
 *   ✅ GET /api/health
 *   ✅ GET /api/items              — público, cacheado desde Google Sheets
 *   ✅ GET /api/items/categories   — categorías con conteos
 *
 * Fase 3 añadirá:
 *   /api/auth/login (bcrypt + JWT + rate limit)
 *   POST/PATCH/DELETE /api/items  (protegidos)
 */
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { config } from './config/env.js'
import itemsRouter from './routes/items.js'

const app = express()

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
    ts: new Date().toISOString(),
  })
})

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
    `(env=${config.env}, sheets=${config.sheetsEnabled ? 'ON' : 'MOCK'}, client=${config.clientOrigin})`,
  )
})
