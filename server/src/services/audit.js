/**
 * Registro de auditoría de acciones administrativas.
 *
 * Formato de fila: [timestamp, user, action, entity_id, changes_json, ip]
 *
 * Estrategia dual: pestaña `audit_log` en Sheets, o append a un JSON local
 * cuando Sheets no está configurado. Nunca falla la operación principal por
 * un error en la auditoría — se registra en consola y sigue.
 */
import { appendFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { google } from 'googleapis'

import { config } from '../config/env.js'

const SHEET_TAB = 'audit_log'
const SHEET_APPEND_RANGE = `${SHEET_TAB}!A1:F1`
const SHEET_READ_RANGE = `${SHEET_TAB}!A1:F1000`
const LOCAL_LOG = join(process.cwd(), 'server', 'data', 'audit.local.log')
const LOCAL_LOG_FALLBACK = join(process.cwd(), 'data', 'audit.local.log')

function getSheetsClient() {
  // La auditoría es un registro INTERNO de la app; no se escribe en la hoja de
  // inventario del cliente. Siempre va al log local (server/data/audit.local.log).
  return null
}

function localLogPath() {
  const p = existsSync(dirname(LOCAL_LOG)) ? LOCAL_LOG : LOCAL_LOG_FALLBACK
  mkdirSync(dirname(p), { recursive: true })
  return p
}

/**
 * @param {object} entry
 * @param {string} entry.user
 * @param {string} entry.action        p. ej. 'item.create' | 'item.update' | 'item.delete'
 * @param {string} entry.entityId
 * @param {object} entry.changes
 * @param {string} entry.ip
 */
export async function audit({ user, action, entityId = '', changes = {}, ip = '' }) {
  const row = [new Date().toISOString(), user, action, entityId, JSON.stringify(changes), ip]
  const client = getSheetsClient()

  if (client) {
    try {
      await client.spreadsheets.values.append({
        spreadsheetId: config.sheets.id,
        range: SHEET_APPEND_RANGE,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [row] },
      })
      return
    } catch (err) {
      console.error('[audit] Sheets append falló, fallback a archivo local:', err.message)
    }
  }

  const target = localLogPath()
  appendFileSync(target, JSON.stringify({ ts: row[0], user, action, entityId, changes, ip }) + '\n')
}

/**
 * Lee las últimas N entradas del audit log (para la página admin).
 * Devuelve más recientes primero.
 */
export async function listAudit({ limit = 200 } = {}) {
  const client = getSheetsClient()
  if (client) {
    try {
      const res = await client.spreadsheets.values.get({
        spreadsheetId: config.sheets.id,
        range: SHEET_READ_RANGE,
      })
      const rows = res.data.values || []
      const entries = rows
        // Salta la fila de encabezado si existe (ts es "timestamp" o similar).
        .filter((r) => r[0] && /^\d{4}-/.test(r[0]))
        .map((r) => ({
          ts: r[0], user: r[1], action: r[2], entityId: r[3],
          changes: tryParse(r[4]), ip: r[5],
        }))
      return entries.slice(-limit).reverse()
    } catch (err) {
      console.error('[audit] read Sheets falló:', err.message)
      return []
    }
  }

  const p = existsSync(LOCAL_LOG) ? LOCAL_LOG : (existsSync(LOCAL_LOG_FALLBACK) ? LOCAL_LOG_FALLBACK : null)
  if (!p) return []
  const lines = readFileSync(p, 'utf8').split('\n').filter(Boolean)
  return lines.slice(-limit).reverse().map((l) => {
    try { return JSON.parse(l) } catch { return null }
  }).filter(Boolean)
}

function tryParse(s) {
  try { return JSON.parse(s) } catch { return String(s) }
}
