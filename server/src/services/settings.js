/**
 * Configuración GLOBAL de la aplicación (preferencias del sitio, no del catálogo).
 *
 * Estrategia de almacenamiento: JSON local interno de la app
 * (`server/data/settings.local.json`, gitignored) — mismo patrón que los
 * usuarios admin (`users.js`) y la auditoría. NO se guarda en la hoja de
 * inventario del cliente.
 *
 * Es una preferencia global (afecta a TODOS los visitantes del catálogo) y
 * persiste entre recargas. Un redespliegue del contenedor sin volumen
 * persistente la reiniciaría al valor por defecto, igual que los usuarios admin.
 *
 * Preferencias:
 *  - stockIndicatorEnabled: si el catálogo muestra los indicadores de
 *    disponibilidad («Disponible», «Quedan pocos», «Sin stock»…). Por
 *    defecto DESHABILITADO.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const LOCAL_STORE_PATH = join(process.cwd(), 'server', 'data', 'settings.local.json')
// Si el proceso arranca desde /server (npm workspace), cwd() puede ser server/.
const LOCAL_STORE_FALLBACK = join(process.cwd(), 'data', 'settings.local.json')

const DEFAULTS = Object.freeze({
  stockIndicatorEnabled: false,
})

function storePath() {
  const p = existsSync(dirname(LOCAL_STORE_PATH)) ? LOCAL_STORE_PATH : LOCAL_STORE_FALLBACK
  mkdirSync(dirname(p), { recursive: true })
  return p
}

/** Lee la configuración global. Nunca lanza: ante cualquier error usa defaults. */
export function getSettings() {
  const p = storePath()
  if (!existsSync(p)) return { ...DEFAULTS }
  try {
    const raw = JSON.parse(readFileSync(p, 'utf8'))
    return { ...DEFAULTS, ...raw }
  } catch {
    return { ...DEFAULTS }
  }
}

/** Aplica un patch validado y persiste. Devuelve la config resultante. */
export function updateSettings(patch = {}) {
  const next = { ...getSettings() }
  if (typeof patch.stockIndicatorEnabled === 'boolean') {
    next.stockIndicatorEnabled = patch.stockIndicatorEnabled
  }
  writeFileSync(storePath(), JSON.stringify(next, null, 2))
  return next
}
