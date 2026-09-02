/**
 * Repositorio de usuarios admin.
 *
 * Estrategia dual (igual que items):
 *  - Si Google Sheets está configurado, usa la pestaña `users`.
 *  - Si no, usa un JSON local (`data/users.local.json`, gitignored).
 *    Esto permite arrancar el auth flow en dev sin credenciales de Sheets.
 *
 * NUNCA se devuelve el hash al frontend. Solo métodos internos lo tocan.
 *
 * Estructura del usuario (mismas columnas en Sheets y en el JSON local):
 *  { id, username, password_hash, role, failed_attempts, locked_until, created_at }
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { google } from 'googleapis'

import { config } from '../config/env.js'

const LOCAL_STORE_PATH = join(
  process.cwd(),
  'server',
  'data',
  'users.local.json',
)
// Cuando el proceso arranca desde dentro de /server (npm workspace),
// cwd() puede ser server/; en ese caso, la ruta se resuelve igualmente.
const LOCAL_STORE_FALLBACK = join(process.cwd(), 'data', 'users.local.json')

const SHEET_TAB = 'users'
const SHEET_RANGE = `${SHEET_TAB}!A1:G1000`
const HEADERS = ['id', 'username', 'password_hash', 'role', 'failed_attempts', 'locked_until', 'created_at']

let sheetsApi = null

/** Devuelve la ruta del JSON local (crea el directorio si hace falta). */
function localStorePath() {
  const p = existsSync(dirname(LOCAL_STORE_PATH)) ? LOCAL_STORE_PATH : LOCAL_STORE_FALLBACK
  mkdirSync(dirname(p), { recursive: true })
  return p
}

function readLocal() {
  const p = localStorePath()
  if (!existsSync(p)) return []
  try {
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return []
  }
}

function writeLocal(users) {
  writeFileSync(localStorePath(), JSON.stringify(users, null, 2))
}

function getSheetsClient() {
  // Los usuarios admin son datos INTERNOS de la app y NO se guardan en la hoja
  // de inventario del cliente. Siempre se almacenan en JSON local
  // (server/data/users.local.json). Esto desacopla las credenciales del
  // catálogo y evita exigir una pestaña `users` en la hoja del cliente.
  return null
}

async function readAll() {
  const client = getSheetsClient()
  if (!client) return readLocal()
  const res = await client.spreadsheets.values.get({
    spreadsheetId: config.sheets.id,
    range: SHEET_RANGE,
  })
  const rows = res.data.values || []
  if (rows.length < 2) return []
  const [, ...body] = rows
  return body.map((r) => ({
    id: r[0] || '',
    username: r[1] || '',
    password_hash: r[2] || '',
    role: r[3] || 'admin',
    failed_attempts: Number(r[4]) || 0,
    locked_until: r[5] || '',
    created_at: r[6] || '',
  })).filter((u) => u.username)
}

async function writeAll(users) {
  const client = getSheetsClient()
  if (!client) return writeLocal(users)
  const values = [HEADERS, ...users.map((u) => [
    u.id, u.username, u.password_hash, u.role || 'admin',
    String(u.failed_attempts || 0), u.locked_until || '', u.created_at || '',
  ])]
  await client.spreadsheets.values.update({
    spreadsheetId: config.sheets.id,
    range: SHEET_RANGE,
    valueInputOption: 'RAW',
    requestBody: { values },
  })
  // Best-effort: además limpiar la hoja de filas sobrantes.
  await client.spreadsheets.values.clear({
    spreadsheetId: config.sheets.id,
    range: `${SHEET_TAB}!A${values.length + 1}:G1000`,
  }).catch(() => {})
}

/**
 * Busca un usuario por username. Devuelve el objeto (con hash) o null.
 * Solo el módulo de auth debería llamar a esto.
 */
export async function findUserByUsername(username) {
  const users = await readAll()
  return users.find((u) => u.username === username) || null
}

/** Crea o reemplaza un usuario. Usado por el CLI create-admin. */
export async function upsertUser(user) {
  const users = await readAll()
  const idx = users.findIndex((u) => u.username === user.username)
  const now = new Date().toISOString()
  const full = {
    id: user.id || `U-${Date.now()}`,
    username: user.username,
    password_hash: user.password_hash,
    role: user.role || 'admin',
    failed_attempts: 0,
    locked_until: '',
    created_at: user.created_at || now,
  }
  if (idx === -1) users.push(full)
  else users[idx] = { ...users[idx], ...full }
  await writeAll(users)
  return full
}

/** Actualiza intentos fallidos / bloqueo tras un login. */
export async function updateUserAttempts(username, { failed_attempts, locked_until }) {
  const users = await readAll()
  const idx = users.findIndex((u) => u.username === username)
  if (idx === -1) return
  users[idx].failed_attempts = failed_attempts
  users[idx].locked_until = locked_until || ''
  await writeAll(users)
}

export function usersBackend() {
  return 'local-json'
}
