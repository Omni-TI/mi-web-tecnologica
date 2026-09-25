import { Router } from 'express'
import { z } from 'zod'

import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { audit } from '../services/audit.js'
import { getSettings, updateSettings } from '../services/settings.js'

const router = Router()

const SettingsSchema = z.object({
  stockIndicatorEnabled: z.boolean(),
})

/* ===== Público ===== */
// El catálogo lo consulta para saber si mostrar los indicadores de stock.
router.get('/', (_req, res) => {
  res.json(getSettings())
})

/* ===== Admin ===== */
// Alterna la preferencia global del indicador de stock. Protegido por auth + CSRF.
router.patch('/', requireAuth, validateBody(SettingsSchema), async (req, res, next) => {
  try {
    const updated = updateSettings(req.body)
    await audit({
      user: req.user.username,
      action: 'settings.update',
      entityId: 'stockIndicatorEnabled',
      changes: { stockIndicatorEnabled: updated.stockIndicatorEnabled },
      ip: req.ip,
    })
    res.json(updated)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    next(err)
  }
})

export default router
