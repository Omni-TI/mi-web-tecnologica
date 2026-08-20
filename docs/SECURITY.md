# Documento de seguridad — Siete Rayos

> **Estado: Fase 2.** ✅ = implementado · ⏳ = planificado en fase posterior.

## Autenticación y sesiones

- ⏳ Contraseñas hasheadas con **bcrypt** (12 rounds).
- ⏳ **JWT** de acceso (15 min) + refresh token (7 d) rotativo.
- ⏳ Cookies `HttpOnly`, `Secure`, `SameSite=Strict`.
- ⏳ Rate limit en `/api/auth/login` (5 intentos / 15 min por IP + usuario).
- ⏳ Bloqueo temporal del usuario tras 5 intentos fallidos.

## Protección de la aplicación

- ✅ **Helmet** activo con defaults (Fase 4: endurecemos CSP + HSTS).
- ✅ **CORS** restringido a `CLIENT_ORIGIN` con `credentials: true`.
- ✅ `x-powered-by` deshabilitado.
- ✅ Límite de body `100 KiB` en JSON.
- ⏳ **CSRF tokens** en formularios sensibles (patrón doble-submit) — Fase 3.
- ✅ Validación con **zod** al mapear filas de Sheets; filas malformadas se descartan.
- ✅ Regla de negocio `disponibles + en_arriendo === cantidad_total` validada
      centralmente en `server/src/schemas/item.js`.
- ✅ Sin `dangerouslySetInnerHTML`; escape por defecto de React se preserva.

## Manejo de secretos

- ✅ `.env` fuera del repo (root y por workspace); `.env.example` documenta variables.
- ✅ `.gitignore` excluye `.env*`, `credentials.json`, `service-account*.json`.
- ✅ El backend acepta credenciales de Sheets desde:
      **(a)** archivo local (`GOOGLE_SERVICE_ACCOUNT_FILE`) o
      **(b)** JSON en base64 en variable de entorno (`GOOGLE_SERVICE_ACCOUNT_JSON_B64`) — para producción.

## Base de datos (Google Sheets)

- ✅ **Todas** las lecturas al catálogo pasan por el backend
      (`server/src/services/sheets.js`). El frontend no importa `googleapis`
      ni jamás recibe credenciales.
- ✅ **Caché en memoria con TTL** (default 20s) para reducir llamadas a la API
      y proteger frente a rate limit; ante error transitorio se sirve la caché anterior.
- ✅ **Fallback a mock** cuando Sheets no está configurado — permite dev sin credenciales.
- ⏳ Toda mutación requerirá admin autenticado (middleware) — Fase 3.
- ⏳ Auditoría en pestaña `audit_log` (usuario, acción, timestamp, IP, diff) — Fase 3.
- ⏳ Recomendación: activar el Historial de versiones de Google Drive como backup.

## Cliente

- ✅ Toda petición a Sheets va a través del backend.
- ✅ `credentials: 'include'` preparado para cookies HttpOnly (Fase 3).
- ✅ `AbortController` en fetch para cancelar al desmontar componentes.
- ✅ Estados accesibles de loading y error (`ErrorPanel` con role="alert").

## Despliegue

- ⏳ HTTPS obligatorio en producción (Vercel + Railway lo proveen por defecto).
- ⏳ Cookies `Secure` requieren HTTPS.
- ⏳ Variables `VITE_API_BASE_URL` (cliente) y `CLIENT_ORIGIN` (servidor) deben
      apuntar a los dominios definitivos.
