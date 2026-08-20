# Despliegue — Siete Rayos

Arquitectura recomendada:

```
        Usuario
           │
           ▼
    ┌───────────────┐        ┌───────────────┐        ┌─────────────┐
    │  Vercel       │──HTTPS─▶│  Railway     │──HTTPS─▶│ Google      │
    │  (frontend)   │        │  (backend)    │        │ Sheets      │
    └───────────────┘        └───────────────┘        └─────────────┘
      claude/... .vercel.app   api.sieterayos.example    Spreadsheet
```

- **Frontend estático** (build de Vite) → **Vercel** (free tier).
- **Backend Node** (Express) → **Railway** (free trial + $5/mes).
- **DB** → **Google Sheets** vía service account.

Ambos proveen HTTPS y variables de entorno seguras.

---

## 0. Requisitos previos

1. Cuenta de GitHub con el repo `omni-ti/mi-web-tecnologica`.
2. Cuenta [Google Cloud](https://console.cloud.google.com/) con Sheets API habilitada y una service account con el JSON descargado
   (ver [`GOOGLE_SHEETS_SETUP.md`](GOOGLE_SHEETS_SETUP.md)).
3. Cuentas [Vercel](https://vercel.com) y [Railway](https://railway.app), ambas conectadas a GitHub.

---

## 1. Desplegar el backend en Railway

### 1.1 Crear proyecto

1. Railway → **New Project → Deploy from GitHub repo** → selecciona `omni-ti/mi-web-tecnologica`.
2. Railway detecta el monorepo. En **Settings → Root directory** pon `server`.
3. **Build command**: `npm install --workspaces --include-workspace-root`
4. **Start command**: `npm start --workspace @siete-rayos/server` (o `node src/index.js`).
5. En **Networking**, activa el dominio público (`.up.railway.app`) o adjunta el tuyo.

### 1.2 Variables de entorno

Copia estas variables (**nunca commitees el JSON de la service account**):

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` (Railway lo inyecta como `$PORT` — el server ya lo usa) |
| `CLIENT_ORIGIN` | `https://sieterayos.vercel.app` (tu dominio real de Vercel) |
| `GOOGLE_SHEETS_ID` | id de la hoja (segmento entre `/d/` y `/edit`) |
| `SHEETS_ITEMS_TAB` | `items` |
| `SHEETS_CACHE_TTL_SEC` | `20` |
| `GOOGLE_SERVICE_ACCOUNT_JSON_B64` | `base64 -w0 secrets/service-account.json` |
| `JWT_ACCESS_SECRET` | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 32` |
| `BCRYPT_ROUNDS` | `12` |
| `LOGIN_RATE_WINDOW_MS` | `900000` |
| `LOGIN_RATE_MAX` | `5` |

### 1.3 Semilla del primer admin

Railway tiene una terminal en **Settings → Deploy → Shell**. Desde ahí:

```bash
npm run admin:create --workspace @siete-rayos/server -- --user admin --password 'CambiaEstoYa!'
```

El hash se guarda en la pestaña `users` de la hoja.

### 1.4 Verificación

```
curl https://<TU-BACKEND>.up.railway.app/api/health
# {"status":"ok","env":"production","sheetsEnabled":true,...}
```

---

## 2. Desplegar el frontend en Vercel

### 2.1 Crear proyecto

1. Vercel → **Add New → Project → Import Git Repository** → `omni-ti/mi-web-tecnologica`.
2. **Root directory**: `client`.
3. **Framework preset**: Vite (auto-detectado).
4. **Build command**: `npm run build` (por defecto).
5. **Output directory**: `dist` (por defecto).

### 2.2 Variables de entorno

| Variable | Valor |
|----------|-------|
| `VITE_API_BASE_URL` | `https://<TU-BACKEND>.up.railway.app` (SIN barra final) |

Redeploy después de setear la variable.

### 2.3 Verificación

Abre `https://<TU-FRONTEND>.vercel.app` — la galería debe mostrar los artículos de la hoja Sheets.

---

## 3. Post-despliegue

- **DNS opcional**: apunta `sieterayos.cl` y `api.sieterayos.cl` a Vercel y Railway respectivamente; actualiza `CLIENT_ORIGIN` y `VITE_API_BASE_URL`.
- **HSTS preload** (opcional): registra `sieterayos.cl` en [hstspreload.org](https://hstspreload.org) una vez que sirvas HTTPS estable.
- **Backups**: activa el historial de versiones de Drive en la hoja (Archivo → Historial de versiones).

## 4. Rotación de secretos

```bash
# Rotar JWT (invalida todas las sesiones existentes)
railway variables set JWT_ACCESS_SECRET=$(openssl rand -hex 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# Rotar contraseña de admin
railway shell
npm run admin:create --workspace @siete-rayos/server -- --user admin --password 'NuevaClave!'
```

## 5. Troubleshooting

| Síntoma | Causa probable | Fix |
|---------|----------------|-----|
| `403 CSRF` en el navegador | El origen del frontend no coincide con `CLIENT_ORIGIN` — el cookie CSRF no cruza | Actualiza `CLIENT_ORIGIN` en Railway |
| Login falla `500 AUTH_MISCONFIG` | Faltan `JWT_ACCESS_SECRET` o `JWT_REFRESH_SECRET` | Setealos en Railway |
| `/api/items` devuelve `source:"mock"` en prod | `GOOGLE_SHEETS_ID` o credenciales faltan | Sube ambos |
| CSP bloquea recursos | Añade el host a `directives` en `server/src/middleware/security.js` | Redeploy |
