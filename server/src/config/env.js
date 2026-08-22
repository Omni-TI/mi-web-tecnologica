/**
 * Configuración centralizada del servidor.
 * Toda lectura de `process.env` pasa por aquí para no dispersar defaults ni
 * validaciones.
 *
 * Modos de datos (sheetsMode):
 *   - 'sheets-api'  : GOOGLE_SHEETS_ID + service account → lectura y ESCRITURA.
 *   - 'public-csv'  : GOOGLE_SHEETS_ID sin service account → solo LECTURA
 *                     (la hoja debe estar compartida como "cualquiera con el
 *                     enlace: lector"). No requiere Google Cloud.
 *   - 'local'       : sin ID → datos mock / JSON local (dev sin credenciales).
 */
import 'dotenv/config'

const bool = (v, dflt = false) => (v == null ? dflt : /^(1|true|yes|on)$/i.test(v))
const int = (v, dflt) => (v == null ? dflt : Number.parseInt(v, 10))

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: int(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  sheets: {
    id: process.env.GOOGLE_SHEETS_ID || '',
    // gid de la pestaña (0 = primera). Solo se usa en modo public-csv.
    gid: process.env.GOOGLE_SHEETS_GID || '0',
    serviceAccountFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE || '',
    serviceAccountJsonB64: process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64 || '',
    // TTL para caché de items en segundos (evita golpear Sheets en cada request).
    cacheTtlSec: int(process.env.SHEETS_CACHE_TTL_SEC, 20),
    itemsSheetName: process.env.SHEETS_ITEMS_TAB || 'items',
  },

  /** Modo de datos activo (ver arriba). */
  get sheetsMode() {
    if (!this.sheets.id) return 'local'
    if (this.sheets.serviceAccountFile || this.sheets.serviceAccountJsonB64) return 'sheets-api'
    return 'public-csv'
  },

  /** ¿Estamos leyendo desde Google (cualquier modo)? */
  get sheetsEnabled() {
    return this.sheetsMode !== 'local'
  },

  /**
   * ¿Podemos escribir el inventario desde el panel?
   * Sí con service account (sheets-api) y en modo local (JSON de dev).
   * No en modo public-csv: un link "lector" no permite escribir en la hoja.
   */
  get sheetsCanWrite() {
    return this.sheetsMode !== 'public-csv'
  },

  auth: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
    jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
    jwtRefreshTtl: process.env.JWT_REFRESH_TTL || '7d',
    bcryptRounds: int(process.env.BCRYPT_ROUNDS, 12),
  },

  rateLimit: {
    loginWindowMs: int(process.env.LOGIN_RATE_WINDOW_MS, 900_000),
    loginMax: int(process.env.LOGIN_RATE_MAX, 5),
  },

  logSheetsFallback: bool(process.env.LOG_SHEETS_FALLBACK, true),
}
