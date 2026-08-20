/**
 * Configuración centralizada del servidor.
 * Toda lectura de `process.env` pasa por aquí para no dispersar defaults ni
 * validaciones. Si en el futuro añadimos `zod` para validar env, va aquí.
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
    serviceAccountFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE || '',
    serviceAccountJsonB64: process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64 || '',
    // TTL para caché de items en segundos (evita golpear Sheets en cada request).
    cacheTtlSec: int(process.env.SHEETS_CACHE_TTL_SEC, 20),
    itemsSheetName: process.env.SHEETS_ITEMS_TAB || 'items',
  },

  // Si no hay ID + credenciales, el backend usa mock. Útil para dev.
  get sheetsEnabled() {
    return Boolean(
      this.sheets.id && (this.sheets.serviceAccountFile || this.sheets.serviceAccountJsonB64),
    )
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
