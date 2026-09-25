# Imágenes de artículos (ImageKit)

Las imágenes se alojan en **ImageKit** (CDN + transformaciones en tiempo real).
La subida desde el panel admin es **firmada**: la clave privada vive solo en el
servidor y el archivo se sube **directo** del navegador a ImageKit.

## Flujo

1. El panel pide una firma a `GET /api/uploads/auth` (solo admin).
2. Con esa firma, el navegador sube el archivo a `upload.imagekit.io`.
3. El panel guarda las URLs resultantes en el artículo
   (`PATCH /api/items/:id { imagenes }`), que se escriben en la columna
   **`Imagenes`** de la hoja (separadas por `|`).
4. El catálogo entrega miniaturas/versiones responsive añadiendo
   `?tr=w-…,f-auto,q-auto` a la URL (WebP/AVIF automáticos vía CDN).

## Pasos para configurarlo (una sola vez)

1. Crea una cuenta gratis en <https://imagekit.io> y un **URL-endpoint**
   (algo como `https://ik.imagekit.io/tu_id`).
2. En el panel de ImageKit → **Developer options / API Keys**, copia:
   - **Public key**
   - **Private key** (secreta — no la compartas ni la subas al repo)
   - **URL-endpoint**
3. En `server/.env` (local) y en las variables del despliegue (Railway),
   define:

   ```env
   IMAGEKIT_PUBLIC_KEY=public_xxx
   IMAGEKIT_PRIVATE_KEY=private_xxx
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/tu_id
   IMAGEKIT_FOLDER=/siete-rayos
   ```

4. (Recomendado) En ImageKit → **Settings → Upload**, activa
   *"Restrict unsigned uploads"* para que solo se pueda subir con la firma del
   servidor.
5. Reinicia el servidor. Verifica en `GET /api/health` que
   `images.enabled = true`.

> Sin estas variables, la subida queda deshabilitada (el endpoint responde
> `503`) y el catálogo sigue mostrando los placeholders. Nada más se rompe.

## Notas

- La **columna `Imagenes`** debe existir en la hoja (guarda `url1 | url2 | url3`).
- Máx. 3 imágenes por artículo; tamaño máx. configurable con
  `IMAGE_MAX_UPLOAD_MB` (default 5 MB).
- Borrado remoto en ImageKit: por ahora, quitar una imagen del artículo la
  desvincula (deja de mostrarse) pero no borra el archivo en ImageKit. Se puede
  añadir un borrado real por `fileId` más adelante si se necesita.
