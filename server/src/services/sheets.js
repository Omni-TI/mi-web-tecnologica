/**
 * Cliente de Google Sheets con caché en memoria + operaciones de escritura.
 *
 * Diseño:
 *  - Auth por service account (archivo local o env base64).
 *  - Cache TTL configurable — invalidada tras cada escritura.
 *  - Fallback a mock (lectura) o a JSON local (escritura) cuando Sheets
 *    no está configurado. Esto permite dev end-to-end sin credenciales.
 */
import { google } from 'googleapis'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { config } from '../config/env.js'
import { MOCK_ITEMS } from '../data/mockItems.js'
import { ItemSchema } from '../schemas/item.js'

const HEADERS = ['id', 'nombre', 'categoria', 'valor_arriendo', 'cantidad_total', 'disponibles', 'en_arriendo', 'imagen_url', 'fecha_creacion', 'activo']
const LOCAL_STORE = join(process.cwd(), 'server', 'data', 'items.local.json')
const LOCAL_STORE_FALLBACK = join(process.cwd(), 'data', 'items.local.json')

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

function localPath() {
  const p = existsSync(dirname(LOCAL_STORE)) ? LOCAL_STORE : LOCAL_STORE_FALLBACK
  mkdirSync(dirname(p), { recursive: true })
  return p
}

function readLocalItems() {
  const p = localPath()
  if (!existsSync(p)) {
    // Seed inicial con el mock la primera vez.
    writeFileSync(p, JSON.stringify(MOCK_ITEMS, null, 2))
    return [...MOCK_ITEMS]
  }
  try {
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return [...MOCK_ITEMS]
  }
}

function writeLocalItems(items) {
  writeFileSync(localPath(), JSON.stringify(items, null, 2))
}

/**
 * Convierte una fila cruda (array de celdas) en un item validado.
 * Filas inválidas se descartan con un warn.
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

function itemToRow(it) {
  return [
    it.id, it.nombre, it.categoria,
    Number(it.valor_arriendo), Number(it.cantidad_total),
    Number(it.disponibles), Number(it.en_arriendo),
    it.imagen_url || '', it.fecha_creacion || '',
    it.activo === false ? 'false' : 'true',
  ]
}

async function fetchAllFromSheets() {
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

async function writeAllToSheets(items) {
  const client = getClient()
  if (!client) throw new Error('Sheets not configured')
  const values = [HEADERS, ...items.map(itemToRow)]
  await client.spreadsheets.values.update({
    spreadsheetId: config.sheets.id,
    range: `${config.sheets.itemsSheetName}!A1:J${values.length}`,
    valueInputOption: 'RAW',
    requestBody: { values },
  })
  // Limpia filas sobrantes.
  await client.spreadsheets.values.clear({
    spreadsheetId: config.sheets.id,
    range: `${config.sheets.itemsSheetName}!A${values.length + 1}:J1000`,
  }).catch(() => {})
}

async function readAllRaw() {
  if (config.sheetsEnabled) {
    const items = await fetchAllFromSheets()
    return items ?? []
  }
  return readLocalItems()
}

async function writeAllRaw(items) {
  if (config.sheetsEnabled) return writeAllToSheets(items)
  return writeLocalItems(items)
}

/** Público: devuelve items visibles (respetando `activo`) usando caché. */
export async function getItems({ includeInactive = false } = {}) {
  const now = Date.now()
  const ttlMs = config.sheets.cacheTtlSec * 1000
  if (cache.items.length && now - cache.at < ttlMs) {
    return includeInactive ? cache.items : cache.items.filter((i) => i.activo)
  }

  if (!config.sheetsEnabled && config.logSheetsFallback && !warnedFallback) {
    console.warn(
      '[sheets] Google Sheets no configurado. Sirviendo datos MOCK/JSON local para desarrollo.',
    )
    warnedFallback = true
  }

  try {
    const items = await readAllRaw()
    cache = { at: now, items }
  } catch (err) {
    console.error('[sheets] error consultando Sheets, uso caché previa si existe:', err.message)
    if (cache.items.length === 0) throw err
  }
  return includeInactive ? cache.items : cache.items.filter((i) => i.activo)
}

/** Invalida la caché — se llama tras cada escritura. */
export function invalidateItemsCache() {
  cache = { at: 0, items: [] }
}

/** Crea un item (id se genera si no viene). Devuelve el item creado. */
export async function createItem(input) {
  const all = await readAllRaw()
  const id = `IT-${Date.now().toString(36).toUpperCase()}`
  const item = {
    id,
    fecha_creacion: new Date().toISOString().slice(0, 10),
    activo: true,
    ...input,
  }
  const parsed = ItemSchema.parse(item)
  all.push(parsed)
  await writeAllRaw(all)
  invalidateItemsCache()
  return parsed
}

/** Actualiza un item existente. Devuelve el nuevo estado. */
export async function updateItem(id, patch) {
  const all = await readAllRaw()
  const idx = all.findIndex((i) => i.id === id)
  if (idx === -1) {
    const e = new Error('Item no encontrado'); e.status = 404; throw e
  }
  const merged = { ...all[idx], ...patch, id: all[idx].id }
  const parsed = ItemSchema.parse(merged)
  all[idx] = parsed
  await writeAllRaw(all)
  invalidateItemsCache()
  return parsed
}

/** Elimina un item por id. Devuelve el item eliminado. */
export async function deleteItem(id) {
  const all = await readAllRaw()
  const idx = all.findIndex((i) => i.id === id)
  if (idx === -1) {
    const e = new Error('Item no encontrado'); e.status = 404; throw e
  }
  const [removed] = all.splice(idx, 1)
  await writeAllRaw(all)
  invalidateItemsCache()
  return removed
}
