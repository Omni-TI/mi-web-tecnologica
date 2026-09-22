/**
 * Cliente de datos del catálogo. Tres modos (ver config/env.js → sheetsMode):
 *
 *   - 'sheets-api'  : lectura y escritura vía Google Sheets API (service account).
 *   - 'public-csv'  : lectura desde la hoja publicada como CSV (sin credenciales).
 *                     La escritura NO está disponible en este modo.
 *   - 'local'       : mock / JSON local para desarrollo sin credenciales.
 *
 * Mapeo de columnas: la hoja del cliente usa nombres en español
 * (categorias, sub-categoria1, sub-categoria2, nombre, valor, id, Total,
 * arriendo, disponible). Aquí los normalizamos a nuestro esquema interno.
 */
import { google } from 'googleapis'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { config } from '../config/env.js'
import { MOCK_ITEMS } from '../data/mockItems.js'
import { ItemSchema } from '../schemas/item.js'

const HEADERS = ['id', 'nombre', 'categoria', 'subcategoria1', 'subcategoria2', 'valor_arriendo', 'cantidad_total', 'disponibles', 'en_arriendo', 'imagen_url', 'descripcion', 'garantia', 'no_mostrar', 'no_disponible', 'articulo_unico', 'fecha_creacion', 'activo']
const LOCAL_STORE = join(process.cwd(), 'server', 'data', 'items.local.json')
const LOCAL_STORE_FALLBACK = join(process.cwd(), 'data', 'items.local.json')

let sheetsApi = null
let cache = { at: 0, items: [] }
let warnedFallback = false

/* ───────────────────────── Utilidades de parseo ───────────────────────── */

/** Normaliza un encabezado: minúsculas, sin acentos, sin espacios/guiones/underscore. */
function normHeader(h) {
  return String(h || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s\-_]+/g, '')
    .trim()
}

/** Convierte "$25.000", "25.000", "25,000", "  18000  " → 18000 (entero). */
function parseValor(v) {
  if (v == null) return 0
  const digits = String(v).replace(/[^\d]/g, '')
  return digits ? Number.parseInt(digits, 10) : 0
}

/** Entero tolerante: "3" → 3, "" → 0, "N/A" → 0. */
function parseIntSafe(v) {
  if (v == null) return 0
  const n = Number.parseInt(String(v).replace(/[^\d-]/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

/** ¿'activo' verdadero? (por defecto true si la columna no existe). */
function parseActivo(v) {
  if (v == null || v === '') return true
  return /^(true|1|si|s[ií]|yes|activo|disponible)$/i.test(String(v).trim())
}

/** ¿Bandera verdadera? (por defecto false si la celda está vacía). Acepta TRUE/VERDADERO/SI/1/X. */
function parseFlag(v) {
  if (v == null || v === '') return false
  return /^(true|verdadero|1|si|s[ií]|x|yes)$/i.test(String(v).trim())
}

/**
 * Parser CSV robusto (RFC 4180): soporta comillas dobles, comas y saltos de
 * línea dentro de campos entrecomillados. Devuelve array de arrays de strings.
 */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  const s = String(text).replace(/\r\n?/g, '\n') // normaliza CRLF/CR → LF

  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++ }       // comilla escapada ""
        else inQuotes = false
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field); field = ''
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = ''
    } else {
      field += c
    }
  }
  // Último campo/fila si el archivo no termina en newline.
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }
  return rows
}

/**
 * Mapea un registro crudo (objeto {headerNormalizado: valor}) a nuestro item.
 * Tolerante: solo exige id o nombre; el resto se coacciona con defaults.
 * Devuelve null si la fila está vacía.
 */
function mapRecord(rec) {
  const get = (...keys) => {
    for (const k of keys) {
      if (rec[k] != null && String(rec[k]).trim() !== '') return String(rec[k]).trim()
    }
    return ''
  }

  const id = get('id')
  const nombre = get('nombre')
  if (!id && !nombre) return null // fila vacía

  const total = parseIntSafe(get('total', 'cantidadtotal'))
  const enArriendo = parseIntSafe(get('arriendo', 'enarriendo'))
  const dispRaw = get('disponible', 'disponibles')
  // Si no viene 'disponible', lo derivamos de total - arriendo.
  const disponibles = dispRaw !== '' ? parseIntSafe(dispRaw) : Math.max(0, total - enArriendo)

  return {
    id: id || `IT-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
    nombre: nombre || '(sin nombre)',
    categoria: get('categorias', 'categoria') || 'Sin categoría',
    subcategoria1: get('subcategoria1'),
    subcategoria2: get('subcategoria2'),
    valor_arriendo: parseValor(get('valor', 'valorarriendo')),
    cantidad_total: total,
    disponibles,
    en_arriendo: enArriendo,
    imagen_url: get('imagenurl', 'imagen', 'foto'),
    descripcion: get('descripcion'),
    garantia: get('garantia'),
    no_mostrar: parseFlag(rec['nomostrar']),
    no_disponible: parseFlag(rec['nodisponible']),
    articulo_unico: parseFlag(rec['articulounico']),
    fecha_creacion: get('fechacreacion', 'fecha'),
    activo: parseActivo(rec['activo'] ?? rec['visible']),
  }
}

/** Convierte filas [headers, ...body] en items mapeados (tolerante). */
function rowsToItems(rows) {
  if (!rows || rows.length < 2) return []
  const headers = rows[0].map(normHeader)
  const items = []
  for (let r = 1; r < rows.length; r++) {
    const rec = {}
    headers.forEach((h, i) => { rec[h] = rows[r][i] })
    const item = mapRecord(rec)
    if (item) items.push(item)
  }
  return items
}

/* ───────────────────────── Modo public-csv ───────────────────────── */

function publicCsvUrl() {
  const { id, gid } = config.sheets
  // /export?format=csv respeta permisos "cualquiera con el enlace: lector".
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${encodeURIComponent(gid)}`
}

async function fetchFromPublicCsv() {
  const res = await fetch(publicCsvUrl(), { redirect: 'follow' })
  if (!res.ok) {
    throw new Error(
      `No se pudo leer la hoja pública (HTTP ${res.status}). ` +
      `Verifica que esté compartida como "cualquiera con el enlace: lector".`,
    )
  }
  const text = await res.text()
  // Si Google devuelve HTML (login/permiso), no es CSV válido.
  if (text.trimStart().startsWith('<')) {
    throw new Error('La hoja no es pública. Compártela como "cualquiera con el enlace: lector".')
  }
  return rowsToItems(parseCsv(text))
}

/* ───────────────────────── Modo sheets-api ───────────────────────── */

/** ¿Hay credenciales de service account declaradas (archivo o base64)? */
function isServiceAccountConfigured() {
  return Boolean(config.sheets.serviceAccountJsonB64 || config.sheets.serviceAccountFile)
}

/**
 * Carga y valida las credenciales de la service account.
 * - Devuelve `null` si no hay ninguna declarada (modo público / local).
 * - LANZA un error claro (status 500) si están declaradas pero el archivo no
 *   existe, el base64/JSON es inválido, o falta `client_email`.
 */
function loadCredentials() {
  let raw
  try {
    if (config.sheets.serviceAccountJsonB64) {
      raw = Buffer.from(config.sheets.serviceAccountJsonB64, 'base64').toString('utf8')
    } else if (config.sheets.serviceAccountFile) {
      raw = readFileSync(config.sheets.serviceAccountFile, 'utf8')
    } else {
      return null
    }
  } catch (err) {
    const src = config.sheets.serviceAccountFile || 'GOOGLE_SERVICE_ACCOUNT_JSON_B64'
    const e = new Error(
      `No se pudo leer la credencial de la service account (${src}): ${err.message}. ` +
      'Verifica la ruta en server/.env y que el archivo exista.',
    )
    e.status = 500
    throw e
  }

  let creds
  try {
    creds = JSON.parse(raw)
  } catch {
    const e = new Error(
      'La credencial de la service account no es un JSON válido. ' +
      'Vuelve a descargarla desde Google Cloud (Credenciales → Claves → JSON).',
    )
    e.status = 500
    throw e
  }
  if (!creds.client_email || !creds.private_key) {
    const e = new Error(
      'El JSON de la service account no tiene "client_email"/"private_key". ' +
      '¿Es el archivo correcto descargado desde Google Cloud?',
    )
    e.status = 500
    throw e
  }
  return creds
}

function getClient() {
  if (sheetsApi) return sheetsApi
  const creds = loadCredentials() // puede lanzar (credenciales inválidas)
  if (!creds) return null
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  sheetsApi = google.sheets({ version: 'v4', auth })
  return sheetsApi
}

/**
 * Traduce errores de la API de Google en escritura a mensajes accionables.
 * 403 = la hoja no está compartida con la service account como Editor.
 */
function mapSheetsWriteError(err) {
  const status = err?.code || err?.response?.status
  let email = null
  try { email = loadCredentials()?.client_email || null } catch { /* noop */ }

  if (status === 403) {
    const e = new Error(
      `Google rechazó la escritura (403). Comparte la hoja con la service account` +
      `${email ? ` (${email})` : ''} dándole permiso de Editor.`,
    )
    e.status = 400
    return e
  }
  if (status === 404) {
    const e = new Error('No se encontró la hoja (404). Revisa GOOGLE_SHEETS_ID en server/.env.')
    e.status = 400
    return e
  }
  if (status === 401) {
    const e = new Error('Credenciales rechazadas (401). Regenera la clave JSON de la service account.')
    e.status = 400
    return e
  }
  return err
}

/**
 * Diagnóstico de configuración de Sheets (para GET /api/health). No lanza:
 * reporta el estado incluso si las credenciales son inválidas.
 */
export function getSheetsDiagnostics() {
  const configured = isServiceAccountConfigured()
  let credentialsLoaded = false
  let serviceAccountEmail = null
  let error = null
  if (configured) {
    try {
      const creds = loadCredentials()
      credentialsLoaded = Boolean(creds)
      serviceAccountEmail = creds?.client_email || null
    } catch (err) {
      error = err.message
    }
  }
  return {
    mode: config.sheetsMode,
    canWrite: config.sheetsCanWrite,
    serviceAccountConfigured: configured,
    credentialsLoaded,
    serviceAccountEmail,
    spreadsheetId: config.sheets.id || null,
    error,
  }
}

/**
 * Resuelve el nombre real de la pestaña: si SHEETS_ITEMS_TAB existe, la usa;
 * si no, cae a la primera pestaña de la hoja (robusto ante nombres en español).
 */
let resolvedTab = null
async function getTabName(client) {
  if (resolvedTab) return resolvedTab
  const meta = await client.spreadsheets.get({
    spreadsheetId: config.sheets.id,
    fields: 'sheets.properties.title',
  })
  const titles = (meta.data.sheets || []).map((s) => s.properties.title)
  const want = config.sheets.itemsSheetName
  resolvedTab = titles.includes(want) ? want : (titles[0] || want)
  return resolvedTab
}

async function fetchFromSheetsApi() {
  const client = getClient()
  if (!client) return []
  const tab = await getTabName(client)
  const res = await client.spreadsheets.values.get({
    spreadsheetId: config.sheets.id,
    range: `${tab}!A1:Z5000`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  })
  return rowsToItems(res.data.values || [])
}

/**
 * Mapeo inverso campo interno → nombres de columna (normalizados) que lo
 * representan en la hoja del cliente. Permite escribir de vuelta respetando
 * el orden y los nombres de columna EXISTENTES en la hoja.
 */
const FIELD_TO_HEADERS = {
  id: ['id'],
  nombre: ['nombre'],
  categoria: ['categorias', 'categoria'],
  subcategoria1: ['subcategoria1'],
  subcategoria2: ['subcategoria2'],
  valor_arriendo: ['valor', 'valorarriendo'],
  cantidad_total: ['total', 'cantidadtotal'],
  disponibles: ['disponible', 'disponibles'],
  en_arriendo: ['arriendo', 'enarriendo'],
  imagen_url: ['imagenurl', 'imagen', 'foto'],
  descripcion: ['descripcion'],
  garantia: ['garantia'],
  no_mostrar: ['nomostrar'],
  no_disponible: ['nodisponible'],
  articulo_unico: ['articulounico'],
  fecha_creacion: ['fechacreacion', 'fecha'],
  activo: ['activo', 'visible'],
}

function fieldForHeader(normalized) {
  for (const [field, names] of Object.entries(FIELD_TO_HEADERS)) {
    if (names.includes(normalized)) return field
  }
  return null
}

/** Índice de columna (1) → letra ("A", "Z", "AA", ...). */
function colLetter(n) {
  let s = ''
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26) }
  return s || 'A'
}

function valueForField(it, field) {
  switch (field) {
    case 'valor_arriendo':
    case 'cantidad_total':
    case 'disponibles':
    case 'en_arriendo':
      return Number(it[field] ?? 0)
    case 'activo':
      return it.activo === false ? 'FALSE' : 'TRUE'
    case 'no_mostrar':
    case 'no_disponible':
    case 'articulo_unico':
      return it[field] === true ? 'TRUE' : 'FALSE'
    default:
      return it[field] ?? ''
  }
}

async function writeAllToSheetsApi(items) {
  const client = getClient()
  if (!client) throw new Error('Sheets API no configurado')
  const tab = await getTabName(client)

  // 1. Lee la fila de encabezados actual para PRESERVAR las columnas del cliente.
  const headRes = await client.spreadsheets.values.get({
    spreadsheetId: config.sheets.id,
    range: `${tab}!1:1`,
  })
  let headerRow = (headRes.data.values && headRes.data.values[0]) || []
  // Si la hoja está vacía (sin encabezados), crea los nuestros por defecto.
  if (headerRow.length === 0) headerRow = HEADERS
  const normalized = headerRow.map(normHeader)

  // 2. Cada item → fila alineada a las columnas EXISTENTES (mismo orden).
  const dataRows = items.map((it) =>
    normalized.map((h) => {
      const field = fieldForHeader(h)
      return field ? valueForField(it, field) : ''
    }),
  )

  const lastCol = colLetter(headerRow.length)

  try {
    // 3. Si la hoja estaba vacía, escribe también los encabezados en la fila 1.
    if ((headRes.data.values || []).length === 0) {
      await client.spreadsheets.values.update({
        spreadsheetId: config.sheets.id,
        range: `${tab}!A1:${lastCol}1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headerRow] },
      })
    }

    // 4. Escribe los datos desde la fila 2 (NO toca la fila de encabezados del cliente).
    if (dataRows.length > 0) {
      await client.spreadsheets.values.update({
        spreadsheetId: config.sheets.id,
        range: `${tab}!A2:${lastCol}${dataRows.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: { values: dataRows },
      })
    }
  } catch (err) {
    throw mapSheetsWriteError(err)
  }

  // 5. Limpia filas sobrantes debajo de los datos.
  await client.spreadsheets.values.clear({
    spreadsheetId: config.sheets.id,
    range: `${tab}!A${dataRows.length + 2}:${lastCol}100000`,
  }).catch(() => {})

  invalidateItemsCache()
}

/* ───────────────────────── Modo local ───────────────────────── */

function localPath() {
  const p = existsSync(dirname(LOCAL_STORE)) ? LOCAL_STORE : LOCAL_STORE_FALLBACK
  mkdirSync(dirname(p), { recursive: true })
  return p
}

function readLocalItems() {
  const p = localPath()
  if (!existsSync(p)) {
    writeFileSync(p, JSON.stringify(MOCK_ITEMS, null, 2))
    return [...MOCK_ITEMS]
  }
  try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return [...MOCK_ITEMS] }
}

function writeLocalItems(items) {
  writeFileSync(localPath(), JSON.stringify(items, null, 2))
}

/* ───────────────────────── Dispatch por modo ───────────────────────── */

/** Traduce un fallo de lectura de Sheets en un mensaje accionable. */
function describeSheetsReadError(err) {
  const status = err?.code || err?.response?.status
  const url = String(err?.response?.config?.url || err?.config?.url || err?.response?.request?.responseURL || '')
  if (url.includes('oauth2') || url.includes('token')) {
    return 'Google rechazó la credencial de la service account (token ' + (status || '400') + '). ' +
      'Regenera la clave JSON en Google Cloud (la cuenta de servicio → Claves → Agregar clave → JSON), ' +
      'reemplaza server/secrets/service-account.json y verifica que la hora del sistema esté correcta. ' +
      'Revisa el diagnóstico en /api/health.'
  }
  if (status === 403) {
    return 'Google denegó el acceso a la hoja (403). Habilita "Google Sheets API" en tu proyecto ' +
      'y comparte la hoja con la service account como Lector/Editor.'
  }
  if (status === 404) {
    return 'No se encontró la hoja (404). Revisa GOOGLE_SHEETS_ID en server/.env.'
  }
  return `No se pudo leer Google Sheets: ${err?.message || 'error desconocido'}.`
}

async function readAllRaw() {
  switch (config.sheetsMode) {
    case 'sheets-api': {
      try {
        return await fetchFromSheetsApi()
      } catch (err) {
        const msg = describeSheetsReadError(err)
        console.error('[sheets] lectura vía API falló:', msg)
        // Respaldo de SOLO LECTURA: si la hoja está compartida como pública,
        // sirve el catálogo por CSV mientras se arregla la credencial de escritura.
        try {
          const items = await fetchFromPublicCsv()
          console.warn('[sheets] usando CSV público como respaldo de lectura del catálogo.')
          return items
        } catch {
          const e = new Error(msg); e.status = 502; throw e
        }
      }
    }
    case 'public-csv': return fetchFromPublicCsv()
    default:           return readLocalItems()
  }
}

async function writeAllRaw(items) {
  switch (config.sheetsMode) {
    case 'sheets-api':
      return writeAllToSheetsApi(items)
    case 'public-csv': {
      const e = new Error(
        'La hoja está en modo solo-lectura (CSV público). Para editar el inventario ' +
        'desde el panel necesitas configurar una service account con permiso de edición ' +
        '(ver docs/GOOGLE_SHEETS_SETUP.md).',
      )
      e.status = 400
      throw e
    }
    default:
      return writeLocalItems(items)
  }
}

/* ───────────────────────── API pública del módulo ───────────────────────── */

/** Devuelve items visibles (respetando `activo`) usando caché. */
export async function getItems({ includeInactive = false } = {}) {
  const now = Date.now()
  const ttlMs = config.sheets.cacheTtlSec * 1000
  if (cache.items.length && now - cache.at < ttlMs) {
    return includeInactive ? cache.items : cache.items.filter((i) => i.activo)
  }

  if (config.sheetsMode === 'local' && config.logSheetsFallback && !warnedFallback) {
    console.warn('[sheets] Sin GOOGLE_SHEETS_ID. Sirviendo datos MOCK/JSON local para desarrollo.')
    warnedFallback = true
  }

  try {
    const items = await readAllRaw()
    cache = { at: now, items }
  } catch (err) {
    console.error('[sheets] error leyendo datos, uso caché previa si existe:', err.message)
    if (cache.items.length === 0) throw err
  }
  return includeInactive ? cache.items : cache.items.filter((i) => i.activo)
}

/** Invalida la caché — se llama tras cada escritura. */
export function invalidateItemsCache() {
  cache = { at: 0, items: [] }
}

/**
 * Prefijo de ID derivado del nombre (opción a): 1ª palabra (hasta 4 letras) +
 * 3 primeras letras de la 2ª palabra, capitalizadas. Ej. "Mesa comedor…" → "MesaCom".
 */
function idPrefixFromName(nombre) {
  const words = String(nombre || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim().split(/\s+/).filter(Boolean)
  const cap = (w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
  const p1 = cap(words[0] || 'Item').slice(0, 4)
  const p2 = words[1] ? cap(words[1].slice(0, 3)) : ''
  return (p1 + p2) || 'Item'
}

/** Genera un ID único: prefijo del nombre + correlativo de 2 dígitos. */
function nextItemId(all, nombre) {
  const prefix = idPrefixFromName(nombre)
  const re = new RegExp(`^${prefix}(\\d+)$`, 'i')
  let max = 0
  for (const it of all) {
    const m = re.exec(String(it.id || ''))
    if (m) max = Math.max(max, Number.parseInt(m[1], 10))
  }
  return `${prefix}${String(max + 1).padStart(2, '0')}`
}

export async function createItem(input) {
  const all = await readAllRaw()
  const id = nextItemId(all, input?.nombre)
  const parsed = ItemSchema.parse({
    id,
    fecha_creacion: new Date().toISOString().slice(0, 10),
    activo: true,
    ...input,
  })
  all.push(parsed)
  await writeAllRaw(all)
  invalidateItemsCache()
  return parsed
}

export async function updateItem(id, patch) {
  const all = await readAllRaw()
  const idx = all.findIndex((i) => i.id === id)
  if (idx === -1) { const e = new Error('Item no encontrado'); e.status = 404; throw e }
  const parsed = ItemSchema.parse({ ...all[idx], ...patch, id: all[idx].id })
  all[idx] = parsed
  await writeAllRaw(all)
  invalidateItemsCache()
  return parsed
}

export async function deleteItem(id) {
  const all = await readAllRaw()
  const idx = all.findIndex((i) => i.id === id)
  if (idx === -1) { const e = new Error('Item no encontrado'); e.status = 404; throw e }
  const [removed] = all.splice(idx, 1)
  await writeAllRaw(all)
  invalidateItemsCache()
  return removed
}

/**
 * Ajuste puntual de `disponibles` (control +/- del panel admin).
 *
 * A diferencia de updateItem, NO reescribe toda la hoja: en modo sheets-api
 * actualiza SOLO la celda de disponibles de la fila del item (localizada por su
 * ID en la columna 'id'). Esto es más rápido y reduce condiciones de carrera.
 *
 * Reglas de negocio: 0 <= value <= cantidad_total - en_arriendo.
 */
export async function setDisponibles(id, value) {
  const next = Number(value)
  if (!Number.isInteger(next) || next < 0) {
    const e = new Error('disponibles debe ser un entero mayor o igual a 0'); e.status = 400; throw e
  }

  const all = await readAllRaw()
  const idx = all.findIndex((i) => i.id === id)
  if (idx === -1) { const e = new Error('Item no encontrado'); e.status = 404; throw e }

  const item = all[idx]
  const ceiling = Math.max(0, item.cantidad_total - item.en_arriendo)
  if (next > ceiling) {
    const e = new Error(
      `disponibles no puede superar ${ceiling} (cantidad_total - en_arriendo).`,
    )
    e.status = 400
    throw e
  }

  switch (config.sheetsMode) {
    case 'sheets-api':
      await writeItemCells(id, { disponibles: next })
      break
    case 'public-csv': {
      const e = new Error(
        'La hoja está en modo solo-lectura (CSV público). Para editar el inventario ' +
        'desde el panel necesitas configurar una service account con permiso de edición ' +
        '(ver docs/GOOGLE_SHEETS_SETUP.md).',
      )
      e.status = 400
      throw e
    }
    default: {
      all[idx] = { ...item, disponibles: next }
      writeLocalItems(all)
    }
  }

  invalidateItemsCache()
  return { ...item, disponibles: next }
}

/**
 * Traspaso de una unidad entre disponibles y en_arriendo (control +/- del panel).
 * Escribe AMBAS celdas (disponibles y en_arriendo) de la fila del item.
 *
 * Reglas: ambos enteros >= 0 y disponibles + en_arriendo <= cantidad_total.
 * El frontend hace el traspaso (−1 en uno, +1 en el otro), por lo que la suma
 * se preserva y el total se mantiene igual a cantidad_total.
 */
export async function setStock(id, disponibles, enArriendo) {
  const d = Number(disponibles)
  const a = Number(enArriendo)
  if (!Number.isInteger(d) || d < 0 || !Number.isInteger(a) || a < 0) {
    const e = new Error('disponibles y en_arriendo deben ser enteros mayores o iguales a 0'); e.status = 400; throw e
  }

  const all = await readAllRaw()
  const idx = all.findIndex((i) => i.id === id)
  if (idx === -1) { const e = new Error('Item no encontrado'); e.status = 404; throw e }

  const item = all[idx]
  if (d + a > item.cantidad_total) {
    const e = new Error(`disponibles + en_arriendo (${d + a}) no puede superar cantidad_total (${item.cantidad_total}).`)
    e.status = 400
    throw e
  }

  switch (config.sheetsMode) {
    case 'sheets-api':
      await writeItemCells(id, { disponibles: d, en_arriendo: a })
      break
    case 'public-csv': {
      const e = new Error(
        'La hoja está en modo solo-lectura (CSV público). Para editar el inventario ' +
        'desde el panel necesitas configurar una service account con permiso de edición ' +
        '(ver docs/GOOGLE_SHEETS_SETUP.md).',
      )
      e.status = 400
      throw e
    }
    default: {
      all[idx] = { ...item, disponibles: d, en_arriendo: a }
      writeLocalItems(all)
    }
  }

  invalidateItemsCache()
  return { ...item, disponibles: d, en_arriendo: a }
}

/**
 * Escribe una o más celdas de la fila cuyo 'id' coincide, alineando cada campo
 * a su columna real en la hoja del cliente. Localiza fila/columnas leyendo la
 * fila de encabezados y la columna 'id' — robusto ante filas en blanco o
 * reordenamiento de columnas.
 *
 * @param {string} id
 * @param {Record<string, number|string>} fieldValues  campo interno → valor
 */
async function writeItemCells(id, fieldValues) {
  const client = getClient()
  if (!client) throw new Error('Sheets API no configurado')
  const tab = await getTabName(client)

  const res = await client.spreadsheets.values.get({
    spreadsheetId: config.sheets.id,
    range: `${tab}!A1:Z5000`,
  })
  const rows = res.data.values || []
  if (rows.length < 2) throw new Error('La hoja no tiene datos')

  const norm = rows[0].map(normHeader)
  const idCol = norm.findIndex((h) => fieldForHeader(h) === 'id')
  if (idCol === -1) throw new Error('No se encontró la columna "id" en la hoja')

  let sheetRow = -1
  for (let r = 1; r < rows.length; r++) {
    if (String(rows[r][idCol] ?? '').trim() === String(id).trim()) {
      sheetRow = r + 1 // 1-based
      break
    }
  }
  if (sheetRow === -1) throw new Error('No se encontró la fila del item en la hoja')

  // Construye una celda por campo pedido (que exista como columna en la hoja).
  const data = []
  for (const [field, value] of Object.entries(fieldValues)) {
    const colIdx = norm.findIndex((h) => fieldForHeader(h) === field)
    if (colIdx === -1) continue // la hoja no tiene esa columna: se omite
    const col = colLetter(colIdx + 1)
    data.push({ range: `${tab}!${col}${sheetRow}`, values: [[value]] })
  }
  if (data.length === 0) throw new Error('Ninguna columna coincide en la hoja')

  try {
    await client.spreadsheets.values.batchUpdate({
      spreadsheetId: config.sheets.id,
      requestBody: { valueInputOption: 'RAW', data },
    })
  } catch (err) {
    throw mapSheetsWriteError(err)
  }
}
