# Documento de seguridad — Siete Rayos

> **Estado: Fase 4 (final).** ✅ = implementado · ⏳ = decisión operativa a cargo del despliegue.

## Autenticación y sesiones

- ✅ Contraseñas hasheadas con **bcrypt** (12 rondas por defecto — configurable).
- ✅ **JWT** de acceso (15 min) + refresh token (7 d).
- ✅ Cookies `HttpOnly`, `SameSite=Strict`; `Secure` en producción.
- ✅ Rate limit en `/api/auth/login` (5 intentos / 15 min por IP; `express-rate-limit`).
- ✅ Bloqueo temporal del usuario tras 5 intentos fallidos (15 min).
- ✅ Respuesta genérica a login inválido (mismo mensaje si no existe el user y si password mal).
- ✅ Comparación con hash falso cuando no existe el usuario (evita timing side-channel).

## Protección de la aplicación

- ✅ **Helmet** con **CSP estricta** en producción:
      `default-src 'self'`, `script-src 'self'`, `img-src self/data/https`,
      `font-src` + `style-src` limitados a `fonts.googleapis.com` / `fonts.gstatic.com`,
      `frame-ancestors 'none'`, `upgrade-insecure-requests`.
- ✅ **HSTS** (`max-age=2 años, includeSubDomains, preload`) en producción.
- ✅ **Referrer-Policy** `strict-origin-when-cross-origin`.
- ✅ `x-powered-by` deshabilitado; `X-Frame-Options`, `X-Content-Type-Options` por Helmet.
- ✅ **CORS** restringido a `CLIENT_ORIGIN` con `credentials: true`.
- ✅ **CSRF token** con patrón doble-submit (`sr_csrf`) — todas las mutaciones y `/api/auth/*` lo exigen.
- ✅ Validación con **zod** para todos los bodies + regla de negocio
      `disponibles + en_arriendo === cantidad_total`.
- ✅ Sin `dangerouslySetInnerHTML`; sanitización por defecto de React.
- ✅ Body JSON limitado a `100 KiB`.
- ✅ `trust proxy 1` para que `req.ip` sea correcto detrás de Railway/Vercel.

## Manejo de secretos

- ✅ `.env` fuera del repo (root y por workspace); `.env.example` documenta variables.
- ✅ `.gitignore` excluye `.env*`, `credentials.json`, `service-account*.json`,
      `server/data/*.local.{json,log}`.
- ✅ Credenciales de Sheets admitidas como archivo local (dev) o **base64 en variable** (prod).
- ✅ JWT secrets configurables con `openssl rand -hex 32` (documentado en DEPLOYMENT.md).
- ✅ CLI `admin:create` NUNCA imprime password ni hash.

## Base de datos (Google Sheets)

- ✅ Toda mutación requiere admin autenticado (middleware `requireAuth`) + CSRF.
- ✅ Regla de balance validada en backend con zod (no confiamos en el cliente).
- ✅ Auditoría en pestaña `audit_log` (Sheets) o `server/data/audit.local.log` (dev).
- ✅ Página admin `/admin/auditoria` para revisar las últimas 200 acciones (filtros por usuario, acción y texto).
- ✅ Caché en memoria con TTL 20s + fallback a la caché anterior ante rate limit transitorio.
- ⏳ Backup: activa el historial de versiones de Drive en la hoja.

## Cliente

- ✅ Toda petición a Sheets pasa por el backend; el frontend nunca ve credenciales.
- ✅ Cookies HttpOnly + `credentials:'include'` en fetch; sin tokens en `localStorage`.
- ✅ CSRF token leído de cookie y enviado en `X-CSRF-Token` en todas las mutaciones.
- ✅ `AbortController` en todos los fetch al desmontar componentes.
- ✅ Estados accesibles: `ErrorPanel` con `role="alert"`, `LoadingGrid` con `aria-hidden`.
- ✅ `focus-visible` con anillos de color de marca (WCAG 2.4.7).
- ✅ Landmarks (`<header>`, `<main>`, `<footer>`, `<nav aria-label>`) y `aria-label`
      en elementos interactivos sin texto.
- ✅ Code splitting por ruta (`React.lazy`) — bundle inicial ~50% más liviano.

## Despliegue

- ✅ HTTPS obligatorio en producción (Vercel + Railway lo proveen).
- ✅ Cookies `Secure` activadas cuando `NODE_ENV=production`.
- ✅ Documentación paso a paso en `docs/DEPLOYMENT.md` con troubleshooting.
