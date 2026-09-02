# Configuración de Google Sheets con ESCRITURA (service account)

Con esto, el panel `/admin` puede **crear, editar y eliminar** artículos y esos
cambios se guardan **directamente en tu Google Sheet**.

> ¿Por qué una service account? Un link "editor" deja editar a una persona en el
> navegador, pero NO permite que el servidor de la app escriba. Google exige que
> el servidor tenga su propia identidad autenticada: eso es la service account
> (un "email de robot" al que le das permiso de editor en tu hoja).

Los **usuarios admin** y el **log de auditoría** NO se guardan en tu hoja de
inventario: viven en archivos locales del servidor. Tu hoja es solo el catálogo.

---

## 1. Crear proyecto en Google Cloud

1. Entra a [console.cloud.google.com](https://console.cloud.google.com/) con tu cuenta de Google.
2. Barra superior → selector de proyecto → **Proyecto nuevo** → nombre `siete-rayos` → **Crear**.
3. Asegúrate de tenerlo seleccionado como proyecto activo.

## 2. Habilitar Google Sheets API

1. En el buscador superior escribe **Google Sheets API** → ábrela → **Habilitar**.
   (O menú ☰ → **APIs y servicios → Biblioteca** → busca → **Habilitar**.)

## 3. Crear la service account y su clave

1. Menú ☰ → **APIs y servicios → Credenciales**.
2. **+ Crear credenciales → Cuenta de servicio**.
3. Nombre: `sieterayos-bot` → **Crear y continuar** → (sin roles) **Continuar** → **Listo**.
4. Abre la cuenta recién creada → pestaña **Claves** → **Agregar clave → Crear clave nueva → JSON** → **Crear**.
5. Se descarga un archivo `.json`. Guárdalo bien: son las credenciales del robot.

## 4. Compartir tu hoja con el robot

1. Abre el JSON descargado y copia el valor de `client_email`
   (algo como `sieterayos-bot@siete-rayos-xxxxx.iam.gserviceaccount.com`).
2. En tu Google Sheet → botón **Compartir** → pega ese email → rol **Editor** →
   (desmarca "Notificar") → **Enviar / Compartir**.

## 5. Poner la credencial en el proyecto

1. En tu proyecto crea la carpeta `server\secrets`.
2. Copia el JSON ahí y renómbralo a `service-account.json`
   (ruta final: `server\secrets\service-account.json`).
   *Nunca lo subas a Git — el `.gitignore` ya lo excluye.*

## 6. Configurar `server\.env`

Edita `server\.env` y deja estas líneas así (el ID de tu hoja ya viene puesto):

```
GOOGLE_SHEETS_ID=1gtDZbyLpoUCb8BUCYKWVB_QN2RambooTc4tv9a1z4w0
GOOGLE_SERVICE_ACCOUNT_FILE=./secrets/service-account.json
```

Deja `GOOGLE_SERVICE_ACCOUNT_JSON_B64` vacío.

## 7. Reiniciar y verificar

```powershell
npm run dev
```

Comprueba en el navegador: `http://localhost:4000/api/health`
Debe mostrar `"sheetsEnabled": true`. En `/admin` reaparecen los botones de
crear/editar/eliminar, y los cambios se escriben en tu hoja.

---

## Notas importantes

- **Tus columnas se respetan.** La app lee la fila 1 de tu hoja como encabezados
  (`categorias`, `sub-categoria1`, `sub-categoria2`, `nombre`, `valor`, `id`,
  `Total`, `arriendo`, `disponible`) y escribe de vuelta en esas mismas columnas,
  en el mismo orden. No las renombra ni las reordena.
- Los datos deben empezar en la **fila 2** (fila 1 = encabezados).
- Al editar, el `valor` se guarda como número simple (p. ej. `35000`).
- Los campos que la app maneja pero tu hoja no tiene como columna
  (imagen, fecha) simplemente no se escriben; no pasa nada.

## Producción (opcional)

En plataformas que no permiten subir archivos (Railway, etc.), convierte el JSON
a base64 y ponlo en `GOOGLE_SERVICE_ACCOUNT_JSON_B64` en vez del archivo:

```bash
base64 -w0 server/secrets/service-account.json
```
