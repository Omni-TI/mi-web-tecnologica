# @siete-rayos/server

Backend Express para Siete Rayos.

**Fase 1** — solo scaffold: levanta el servidor con Helmet + CORS y expone `GET /api/health`.
**Fase 2** — integración con Google Sheets, endpoint `/api/items`.
**Fase 3** — autenticación JWT + bcrypt + CRUD protegido.
**Fase 4** — endurecimiento de seguridad (CSP, CSRF, rate limits finales, auditoría).

## Uso local

```bash
cp .env.example .env
# edita .env con tus valores
npm run dev --workspace @siete-rayos/server
```

Ver `docs/GOOGLE_SHEETS_SETUP.md` (raíz) para la configuración de credenciales
en Fase 2.
