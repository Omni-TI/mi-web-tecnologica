import { Router } from 'express'

import { requireAuth } from '../middleware/auth.js'
import { getUploadAuthParams } from '../services/imagekit.js'

const router = Router()

/**
 * Firma de subida para el panel (solo admin). El navegador usa estos parámetros
 * para subir el archivo DIRECTO a ImageKit; la clave privada nunca se expone.
 */
router.get('/auth', requireAuth, (_req, res, next) => {
  try {
    res.json(getUploadAuthParams())
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    next(err)
  }
})

export default router
