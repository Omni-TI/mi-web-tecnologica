/**
 * Cliente de Google Sheets con caché en memoria.
 *
 * Diseño:
 *  - Autenticación por service account leída de un archivo local (dev)
 *    o de una variable de entorno base64 (producción — plataformas que
 *    no dejan subir secretos como archivo).
 *  - Cache TTL configurable (default 20s) para no golpear la API Sheets
 *    en cada request de galería.
 *  - Si Sheets no está configurado, cae a un mock local para permitir
 *    desarrollo end-to-end sin credenciales. Se registra una vez al inicio.
 *
 * En Fase 3 se añaden aquí los métodos writeItem/updateItem/deleteItem
 * y las hojas `users` y `audit_log`.
 */
import { google } from 'googleapis'
import { readFileSync } from 'node:fs'

import { config } from '../config/env.js'
import { MOCK_ITEMS } from '../data/mockItems.js'
import { ItemSchema } from '../schemas/item.js'

// Estado global de este módulo (singleton).
let sheetsApi = null
let cache = { at: 0, items: [] }
let warnedFallback = false

function loadCredentials() {
  if (config.sheets.serviceAccountJsonB64) {
    return JSON.parse(
      Buffer.from(config.sheets.serviceAccountJsonB64, 'base64').toString('utf8'),
    )
  }
  if (config.sheets.serviceAccountFile) {
    return JSON.parse(readFileSync(config.sheets.serviceAccountFile, 'utf8'))
  }
  return null
}

function getClient() {
  if (sheetsApi) return sheetsApi
  const creds = loadCredentials()
  if (!creds) return null
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  sheetsApi = google.sheets({ version: 'v4', auth })
  return sheetsApi
}

/**
 * Convierte una fila cruda (array de celdas) en un objeto item validado.
 * Filas inválidas se descartan silenciosamente (con un warn en consola).
 */
function rowToItem(row, headers) {
  const raw = Object.fromEntries(headers.map((h, i) => [h, row[i] ?? '']))
  const shaped = {
    id: String(raw.id ?? '').trim(),
    nombre: String(raw.nombre ?? '').trim(),
    categoria: String(raw.categoria ?? '').trim(),
    valor_arriendo: Number(raw.valor_arriendo) || 0,
    cantidad_total: Number(raw.cantidad_total) || 0,
    disponibles: Number(raw.disponibles) || 0,
    en_arriendo: Number(raw.en_arriendo) || 0,
    imagen_url: String(raw.imagen_url ?? '').trim(),
    fecha_creacion: String(raw.fecha_creacion ?? '').trim(),
    activo: raw.activo == null || raw.activo === '' ? true : /^(true|1|si|sí|yes)$/i.test(String(raw.activo)),
  }
  const parsed = ItemSchema.safeParse(shaped)
  if (!parsed.success) {
    console.warn(`[sheets] fila descartada id=${shaped.id}: ${parsed.error.issues.map((i) => i.message).join('; ')}`)
    return null
  }
  return parsed.data
}

async function fetchFromSheets() {
  const client = getClient()
  if (!client) return null
  const res = await client.spreadsheets.values.get({
    spreadsheetId: config.sheets.id,
    range: `${config.sheets.itemsSheetName}!A1:Z1000`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  })
  const rows = res.data.values || []
  if (rows.length < 2) return []
  const [headers, ...body] = rows
  const norm = headers.map((h) => String(h).trim().toLowerCase())
  return body.map((r) => rowToItem(r, norm)).filter(Boolean)
}

/**
 * Devuelve los items disponibles al público.
 * Aplica el TTL de caché. Si Sheets no está configurado, devuelve el mock.
 */
export async function getItems({ includeInactive = false } = {}) {
  const now = Date.now()
  const ttlMs = config.sheets.cacheTtlSec * 1000

  if (cache.items.length && now - cache.at < ttlMs) {
    return includeInactive ? cache.items : cache.items.filter((i) => i.activo)
  }

  if (!config.sheetsEnabled) {
    if (config.logSheetsFallback && !warnedFallback) {
      console.warn(
        '[sheets] Google Sheets no configurado (falta GOOGLE_SHEETS_ID o credenciales). ' +
        'Sirviendo datos MOCK para desarrollo.',
      )
      warnedFallback = true
    }
    cache = { at: now, items: MOCK_ITEMS }
  } else {
    try {
      const items = await fetchFromSheets()
      cache = { at: now, items: items ?? [] }
    } catch (err) {
      // Si Sheets falla puntualmente, sirve la última caché válida — evita
      // caer la galería por un rate limit transitorio.
      console.error('[sheets] error consultando Sheets, uso caché previa si existe:', err.message)
      if (cache.items.length === 0) throw err
    }
  }
  return includeInactive ? cache.items : cache.items.filter((i) => i.activo)
}

/** Invalida la caché — útil tras una escritura administrativa (Fase 3). */
export function invalidateItemsCache() {
  cache = { at: 0, items: [] }
}
