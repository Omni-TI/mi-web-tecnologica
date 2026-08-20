import { Router } from 'express'
import { getItems } from '../services/sheets.js'
import { config } from '../config/env.js'

const router = Router()

/**
 * GET /api/items
 * Público. Devuelve el catálogo listo para consumo del cliente.
 * Cabecera Cache-Control corta permite CDN/proxy revalidar frecuentemente.
 */
router.get('/', async (_req, res, next) => {
  try {
    const items = await getItems()
    res.set('Cache-Control', `public, max-age=${config.sheets.cacheTtlSec}`)
    res.json({
      source: config.sheetsEnabled ? 'sheets' : 'mock',
      count: items.length,
      items,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/items/categories
 * Deriva la lista de categorías con conteos — evita que el frontend
 * la calcule redundantemente y facilita cachear en CDN.
 */
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
  } catch (err) {
    next(err)
  }
})

export default router
