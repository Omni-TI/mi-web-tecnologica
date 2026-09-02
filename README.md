# Siete Rayos

Aplicación web para la empresa **Siete Rayos** — arriendo de artículos de utilería.

Repositorio monorepo:

```
/client   → Frontend React 19 + Vite + Tailwind (paleta "Tormenta cálida")
/server   → Backend Node.js + Express + Google Sheets API
/docs     → Guías de configuración (Google Sheets, seguridad, despliegue)
```

## Estado del proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Setup, estructura de páginas y navegación (contenido placeholder) | ✅ |
| 2 | Backend + integración con Google Sheets + galería/dashboard consumiendo API | ✅ |
| 3 | Panel admin: login (JWT + bcrypt) + CRUD del inventario | ✅ |
| 4 | Endurecimiento de seguridad + página de auditoría + code split + docs de despliegue | ✅ |

## Requisitos

- Node.js **20+**
- npm 10+

## Instalación

```bash
git clone <repo>
cd mi-web-tecnologica
npm install            # instala workspaces (client + server)
```

## Configuración

```bash
cp server/.env.example server/.env    # backend
cp client/.env.example client/.env    # frontend (opcional en dev)
```

Sin credenciales Google, el backend arranca en modo **MOCK** y sirve un
catálogo de ejemplo. Para conectar la hoja real sigue
[`docs/GOOGLE_SHEETS_SETUP.md`](docs/GOOGLE_SHEETS_SETUP.md).

## Desarrollo

```bash
npm run dev            # levanta client + server en paralelo (concurrently)

# o por separado:
npm run dev:server     # http://localhost:4000  → API
npm run dev:client     # http://localhost:5173  → SPA (proxya /api al backend)
```

## Verificación rápida

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/items | jq '.source, .count'
```

## Scripts

| Comando | Efecto |
|---------|--------|
| `npm run dev` | Client + server en paralelo |
| `npm run dev:client` | Solo Vite (frontend) |
| `npm run dev:server` | Solo Express (backend) |
| `npm run build` | Build de producción del frontend |
| `npm run lint` | Lint en todos los workspaces |
| `npm start` | Inicia el server en modo producción |

## Variables de entorno

- **Backend** (`server/.env`) — ver `server/.env.example`. Incluye Google
  Sheets, JWT (Fase 3) y rate limits.
- **Frontend** (`client/.env`) — `VITE_API_BASE_URL` (vacío en dev, URL del
  backend desplegado en prod).

Nunca subas `.env` ni credenciales — el `.gitignore` ya está preparado.

## Primer admin

Cuando arranques por primera vez (Sheets configurado o modo local):

```bash
npm run admin:create --workspace @siete-rayos/server -- --user admin --password 'CambiaEsto!'
```

El script hashea con bcrypt y guarda en la hoja `users` (o en
`server/data/users.local.json` si Sheets no está configurado). Reejecutarlo
con el mismo `--user` rota la contraseña.

## Documentación

- [`docs/GOOGLE_SHEETS_SETUP.md`](docs/GOOGLE_SHEETS_SETUP.md) — configuración de la hoja + service account.
- [`docs/SECURITY.md`](docs/SECURITY.md) — checklist de medidas implementadas.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — despliegue Vercel + Railway con troubleshooting.

## Stack

- **Frontend**: React 19, Vite 8, TailwindCSS 3, React Router 7, Recharts, Fuse.js, Headless UI, Sonner
- **Backend**: Express, Helmet, googleapis, zod, cookie-parser, bcrypt/jsonwebtoken (para Fase 3)
- **Base de datos**: Google Sheets vía service account
- **Despliegue objetivo**: Vercel (frontend) + Railway (backend)
