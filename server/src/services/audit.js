/**
 * Registro de auditoría de acciones administrativas.
 *
 * Formato de fila: [timestamp, user, action, entity_id, changes_json, ip]
 *
 * Estrategia dual: pestaña `audit_log` en Sheets, o append a un JSON local
 * cuando Sheets no está configurado. Nunca falla la operación principal por
 * un error en la auditoría — se registra en consola y sigue.
 */
import { appendFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { google } from 'googleapis'
import { readFileSync } from 'node:fs'

import { config } from '../config/env.js'

const SHEET_RANGE = 'audit_log!A1:F1'
const LOCAL_LOG = join(process.cwd(), 'server', 'data', 'audit.local.log')
const LOCAL_LOG_FALLBACK = join(process.cwd(), 'data', 'audit.local.log')

let sheetsApi = null
function getSheetsClient() {
  if (sheetsApi || !config.sheetsEnabled) return sheetsApi
  const creds = config.sheets.serviceAccountJsonB64
    ? JSON.parse(Buffer.from(config.sheets.serviceAccountJsonB64, 'base64').toString('utf8'))
    : JSON.parse(readFileSync(config.sheets.serviceAccountFile, 'utf8'))
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  sheetsApi = google.sheets({ version: 'v4', auth })
  return sheetsApi
}

/**
 * @param {object} entry
 * @param {string} entry.user      username del actor
 * @param {string} entry.action    p. ej. 'item.create' | 'item.update' | 'item.delete'
 * @param {string} entry.entityId  id del recurso afectado
 * @param {object} entry.changes   payload/dif serializable
 * @param {string} entry.ip
 */
export async function audit({ user, action, entityId = '', changes = {}, ip = '' }) {
  const row = [new Date().toISOString(), user, action, entityId, JSON.stringify(changes), ip]
  const client = getSheetsClient()

  if (client) {
    try {
      await client.spreadsheets.values.append({
        spreadsheetId: config.sheets.id,
        range: SHEET_RANGE,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [row] },
      })
      return
    } catch (err) {
      console.error('[audit] Sheets append falló, fallback a archivo local:', err.message)
    }
  }

  const target = existsSync(dirname(LOCAL_LOG)) ? LOCAL_LOG : LOCAL_LOG_FALLBACK
  mkdirSync(dirname(target), { recursive: true })
  appendFileSync(target, JSON.stringify({ ts: row[0], user, action, entityId, changes, ip }) + '\n')
}
