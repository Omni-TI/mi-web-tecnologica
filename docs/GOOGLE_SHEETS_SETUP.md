# Configuración de Google Sheets como base de datos

> Esta guía se completará en **Fase 2**. Aquí queda documentado el flujo
> planificado para que sepas qué preparar.

## 1. Crear proyecto en Google Cloud Console

1. Ve a [console.cloud.google.com](https://console.cloud.google.com/).
2. **Nuevo proyecto** → nombre `siete-rayos`.
3. Selecciónalo como proyecto activo.

## 2. Habilitar Google Sheets API

1. Menú → **APIs y servicios → Biblioteca**.
2. Busca **Google Sheets API** y pulsa **Habilitar**.

## 3. Crear una service account

1. Menú → **IAM y administración → Cuentas de servicio → Crear cuenta**.
2. Nombre: `sieterayos-backend`.
3. Rol: **ninguno** (el acceso se otorga compartiendo la hoja).
4. Termina la creación → abre la cuenta → pestaña **Claves** → **Añadir clave → JSON**.
5. Guarda el JSON como `server/secrets/service-account.json`. **Nunca** lo subas al repo (`.gitignore` ya lo excluye).

## 4. Crear la hoja de cálculo

Crea una hoja llamada **Siete Rayos DB** con estas pestañas:

### Pestaña `items`

| id | nombre | categoria | valor_arriendo | cantidad_total | disponibles | en_arriendo | imagen_url | fecha_creacion | activo |
|----|--------|-----------|----------------|----------------|-------------|-------------|------------|----------------|--------|

### Pestaña `users`

| id | username | password_hash | role | failed_attempts | locked_until | created_at |
|----|----------|---------------|------|-----------------|--------------|------------|

### Pestaña `audit_log`

| timestamp | user | action | entity_id | changes_json | ip |
|-----------|------|--------|-----------|--------------|----|

### Pestaña `categorias` (opcional)

| nombre | color |
|--------|-------|

## 5. Compartir la hoja con la service account

1. Copia el `client_email` del JSON descargado (algo como `sieterayos-backend@…iam.gserviceaccount.com`).
2. En la hoja: **Compartir → añade ese email con permiso Editor**.

## 6. Variables de entorno

Copia el ID de la hoja (el segmento entre `/d/` y `/edit` en la URL) a `server/.env`:

```
GOOGLE_SHEETS_ID=1AbC...xyZ
GOOGLE_SERVICE_ACCOUNT_FILE=./secrets/service-account.json
```

## 7. (Producción) Credencial en base64

Para plataformas que no permiten subir archivos, codifica el JSON:

```bash
base64 -w0 secrets/service-account.json
```

y guárdalo en `GOOGLE_SERVICE_ACCOUNT_JSON_B64`. El backend lo decodificará al iniciar.
