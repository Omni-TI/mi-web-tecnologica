import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listAudit } from '../services/audit.js'

const router = Router()

/** GET /api/audit — admin. Últimas 200 entradas, más recientes primero. */
router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const entries = await listAudit({ limit: 200 })
    res.json({ entries })
  } catch (err) { next(err) }
})

export default router
