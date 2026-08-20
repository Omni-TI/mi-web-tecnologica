# Siete Rayos

Aplicación web para la empresa **Siete Rayos** — arriendo de artículos de utilería.

Repositorio monorepo:

```
/client   → Frontend React 19 + Vite + Tailwind (paleta "Tormenta cálida")
/server   → Backend Node.js + Express + Google Sheets API (scaffold en Fase 1)
/docs     → Guías de configuración (Google Sheets, seguridad, despliegue)
```

## Estado del proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Setup, estructura de páginas y navegación (contenido placeholder) | ✅ En revisión |
| 2 | Integración con Google Sheets + galería pública + búsqueda | Pendiente |
| 3 | Panel admin: login (JWT + bcrypt) + CRUD del inventario | Pendiente |
| 4 | Endurecimiento de seguridad + pulido de diseño + despliegue | Pendiente |

## Requisitos

- Node.js **20+**
- npm 10+

## Instalación

```bash
git clone <repo>
cd mi-web-tecnologica
npm install            # instala workspaces (client + server)
```

## Desarrollo

Arranca ambos workspaces en paralelo:

```bash
# En una terminal
npm run dev:client     # http://localhost:5173

# En otra terminal
cp server/.env.example server/.env
npm run dev:server     # http://localhost:4000
```

O ambos a la vez:

```bash
npm run dev            # levanta client y server en paralelo
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

Ver `server/.env.example`. Nunca subas `.env` ni credenciales al repositorio
(el `.gitignore` ya está preparado).

## Google Sheets

Instrucciones paso a paso en [`docs/GOOGLE_SHEETS_SETUP.md`](docs/GOOGLE_SHEETS_SETUP.md).

## Seguridad

Resumen de medidas en [`docs/SECURITY.md`](docs/SECURITY.md).

## Stack

- **Frontend**: React 19, Vite 8, TailwindCSS 3, React Router 7, Recharts, Fuse.js, Headless UI, Sonner
- **Backend** *(planificado)*: Express, Helmet, bcrypt, jsonwebtoken, googleapis, express-rate-limit, zod
- **Base de datos**: Google Sheets vía service account
- **Despliegue objetivo**: Vercel (frontend) + Railway (backend)

## Contribuir

Trabajar sobre la rama `claude/siete-rayos-rental-app-kcvg8f`. Todos los cambios
llegan a `main` vía Pull Request.
