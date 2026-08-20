/**
 * Siete Rayos — servidor Express (scaffold Fase 1).
 *
 * En Fase 2 se conectará a Google Sheets y se expondrán los endpoints:
 *   GET  /api/health           — ya funciona.
 *   GET  /api/items            — público, cacheado.
 *   POST /api/auth/login       — protegido con rate limit + bcrypt + JWT.
 *   POST /api/items            — admin, valida disponibles + en_arriendo === total.
 *   ...
 *
 * Esta fase solo levanta el servidor con Helmet + CORS restringido para
 * validar la infraestructura.
 */
import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
const PORT = process.env.PORT || 4000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(helmet())
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }))
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', phase: 1, ts: new Date().toISOString() })
})

app.use((_req, res) => res.status(404).json({ error: 'Not Found' }))

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`[siete-rayos] API escuchando en http://localhost:${PORT}`)
})
