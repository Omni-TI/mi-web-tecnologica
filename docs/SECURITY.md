# Documento de seguridad — Siete Rayos

> **Estado: Fase 1.** Este documento se irá completando por fase.
> Las secciones marcadas ⏳ son objetivos planificados; ✅ ya están implementadas.

## Autenticación y sesiones

- ⏳ Contraseñas hasheadas con **bcrypt** (12 rounds).
- ⏳ **JWT** de acceso (15 min) + refresh token (7 d) rotativo.
- ⏳ Cookies `HttpOnly`, `Secure`, `SameSite=Strict`.
- ⏳ Rate limit en `/api/auth/login` (5 intentos / 15 min por IP + usuario).
- ⏳ Bloqueo temporal del usuario tras 5 intentos fallidos (`locked_until`).

## Protección de la aplicación

- ✅ **Helmet** activo con defaults (Fase 4: CSP estricta, HSTS, X-Frame-Options).
- ✅ **CORS** restringido a `CLIENT_ORIGIN`.
- ⏳ **CSRF tokens** en formularios sensibles (patrón doble-submit).
- ⏳ Validación y sanitización con **zod** en todas las entradas.
- ⏳ Sin `dangerouslySetInnerHTML`; escape por defecto de React se preserva.

## Manejo de secretos

- ✅ `.env` fuera del repo; `.env.example` documenta variables.
- ✅ `.gitignore` excluye `.env*`, `credentials.json`, `service-account*.json`.
- ⏳ En producción, credenciales de Google Sheets vía variable de entorno base64.

## Base de datos (Google Sheets)

- ⏳ Toda mutación requiere admin autenticado (middleware).
- ⏳ Validación `disponibles + en_arriendo === cantidad_total` en backend.
- ⏳ Auditoría en pestaña `audit_log` (usuario, acción, timestamp, IP, diff).
- ⏳ Recomendación de backup periódico (Drive → Historial de versiones).

## Cliente

- ✅ Frontend no importa `googleapis` ni credenciales.
- ✅ Toda petición a Sheets va a través del backend.
- ⏳ Error boundaries y toasts para feedback accesible.

## Despliegue

- ⏳ HTTPS obligatorio en producción (Vercel + Railway lo proveen por defecto).
- ⏳ Cookies `Secure` requieren HTTPS.
