import { Router } from 'express'

import { config } from '../config/env.js'
import { getItems, createItem, updateItem, deleteItem, setDisponibles } from '../services/sheets.js'
import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { ItemCreateSchema, ItemUpdateSchema, DisponiblesSchema } from '../schemas/item.js'
import { audit } from '../services/audit.js'

const router = Router()

/* ===== Público ===== */

router.get('/', async (_req, res, next) => {
  try {
    const items = await getItems()
    res.set('Cache-Control', `public, max-age=${config.sheets.cacheTtlSec}`)
    res.json({
      source: config.sheetsEnabled ? 'sheets' : 'mock',
      canWrite: config.sheetsCanWrite,
      sheetUrl: config.sheets.id
        ? `https://docs.google.com/spreadsheets/d/${config.sheets.id}/edit`
        : '',
      count: items.length,
      items,
    })
  } catch (err) { next(err) }
})

router.get('/categories', async (_req, res, next) => {
  try {
    const items = await getItems()
    const counts = new Map()
    for (const it of items) counts.set(it.categoria, (counts.get(it.categoria) || 0) + 1)
    res.set('Cache-Control', `public, max-age=${config.sheets.cacheTtlSec}`)
    res.json({
      categories: Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    })
  } catch (err) { next(err) }
})

/* ===== Admin ===== */

router.post('/', requireAuth, validateBody(ItemCreateSchema), async (req, res, next) => {
  try {
    const created = await createItem(req.body)
    await audit({
      user: req.user.username,
      action: 'item.create',
      entityId: created.id,
      changes: created,
      ip: req.ip,
    })
    res.status(201).json(created)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    next(err)
  }
})

router.patch('/:id', requireAuth, validateBody(ItemUpdateSchema), async (req, res, next) => {
  try {
    const updated = await updateItem(req.params.id, req.body)
    await audit({
      user: req.user.username,
      action: 'item.update',
      entityId: updated.id,
      changes: req.body,
      ip: req.ip,
    })
    res.json(updated)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    next(err)
  }
})

/**
 * Ajuste puntual de unidades disponibles (control +/- del panel).
 * Escritura mínima: solo la celda de disponibles. Protegido por auth admin.
 */
router.patch('/:id/disponibles', requireAuth, validateBody(DisponiblesSchema), async (req, res, next) => {
  try {
    const updated = await setDisponibles(req.params.id, req.body.disponibles)
    await audit({
      user: req.user.username,
      action: 'item.disponibles',
      entityId: updated.id,
      changes: { disponibles: updated.disponibles },
      ip: req.ip,
    })
    res.json(updated)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    next(err)
  }
})

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const removed = await deleteItem(req.params.id)
    await audit({
      user: req.user.username,
      action: 'item.delete',
      entityId: removed.id,
      changes: { nombre: removed.nombre },
      ip: req.ip,
    })
    res.json({ ok: true, id: removed.id })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    next(err)
  }
})

export default router
