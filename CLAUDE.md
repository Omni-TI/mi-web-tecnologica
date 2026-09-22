# CLAUDE.md

Guía para trabajar en este repositorio. Léela antes de hacer cambios.

## Qué es

**Siete Rayos** — aplicación web para arriendo de artículos de utilería.
Catálogo público + panel de administración, con los datos del inventario en
**Google Sheets**. Monorepo con npm workspaces.

```
/client   → Frontend  (React 19 + Vite + TailwindCSS + React Router 7)
/server   → Backend   (Node 20+ + Express 4 + Google Sheets API)
/docs     → Guías (Google Sheets, seguridad, despliegue)
```

## Comandos

Desde la raíz (usa npm workspaces):

```bash
npm install            # instala client + server
npm run dev            # levanta server (:4000) y client (:5173) juntos (concurrently)
npm run build          # build de producción del client (vite build)
npm run lint           # eslint en los workspaces que lo tengan (hoy: client)
npm run start          # server en modo producción
```

Por workspace:

```bash
npm run dev   --workspace client   # solo Vite (:5173, proxya /api → :4000)
npm run dev   --workspace server   # solo Express (:4000, node --watch)
npm run build --workspace client
npm run lint  --workspace client   # eslint .
```

Crear un usuario admin: `npm run admin:create --workspace server`.

**Verificación mínima antes de entregar un cambio de frontend:**
`npm run build` y `npm run lint` (el client) deben pasar. Hay 1 warning
preexistente en `client/src/components/admin/ItemFormModal.jsx` (react-hook-form
`watch()`); no es un error y no es de tus cambios.

## Modos de datos (server)

El backend elige el modo automáticamente en `server/src/config/env.js`
(getter `sheetsMode`), según las variables de entorno:

| Modo | Condición | Lee | Escribe |
|------|-----------|-----|---------|
| `sheets-api` | `GOOGLE_SHEETS_ID` + service account | ✅ | ✅ |
| `public-csv` | `GOOGLE_SHEETS_ID` sin service account (hoja compartida como lector) | ✅ | ❌ |
| `local` | sin `GOOGLE_SHEETS_ID` | ✅ (mock/JSON) | ✅ (JSON local) |

- `config.sheetsCanWrite` = `sheetsMode !== 'public-csv'` — gatea todo lo que
  escribe inventario (botones +/-, crear artículo, etc.).
- **Para correr en local sin credenciales**: no definas `GOOGLE_SHEETS_ID` →
  modo `local` con datos mock. Ideal para desarrollo y para verificar UI.
- Config de ejemplo y setup real en `docs/GOOGLE_SHEETS_SETUP.md`.

## Modelo de datos (artículo)

Esquemas en `server/src/schemas/item.js` (zod, compartido conceptualmente con
el client). Columnas de la hoja / campos del item:

`id, nombre, categoria, subcategoria1, subcategoria2, valor_arriendo,
cantidad_total, disponibles, en_arriendo, imagen_url, imagenes[], descripcion,
garantia, no_mostrar, no_disponible, articulo_unico, fecha_creacion, activo`

- `descripcion` / `garantia`: columnas `Descripcion` / `Garantia` de la hoja
  (texto libre). Se muestran en el detalle del artículo y en el panel admin.
- Banderas (columnas `No mostrar` / `No disponible` / `Articulo unico`, valores
  `TRUE`/vacío; el parseo tolera `SI`/`1`/`X`):
  - `no_mostrar`: oculta el artículo de TODAS las vistas públicas. La regla está
    centralizada en `hooks/useItems.js` (que usan Home y catálogo); el admin usa
    `api.getItems` directo y por eso sigue viéndolo para gestionarlo.
  - `no_disponible`: se muestra pero se ordena al final del catálogo y aparece
    como «Consultar» (ver `lib/stock.js` + `hooks/useCatalogSearch.js`).
  - `articulo_unico`: pieza única; afecta el texto de disponibilidad.

- Regla de negocio **solo en escritura admin**: `disponibles + en_arriendo <= cantidad_total`
  (desigualdad; unidades pueden estar en reparación/reserva). En **lectura** el
  mapeo es tolerante (no descarta filas que no cuadren).
- Categorías/subcategorías **no** son una tabla aparte: se derivan de las
  columnas `categoria` y `subcategoria1` de los propios items.
- `imagenes[]` (hasta 3) está preparado para almacenamiento real (p. ej.
  ImageKit); hoy suele venir vacío y el frontend usa placeholders SVG.

## API (server)

Base `/api`. Auth por **JWT + cookies HttpOnly** con **CSRF double-submit**
(header `X-CSRF-Token` leído de la cookie `sr_csrf`; ver `client/src/lib/api.js`).

Público:
- `GET  /api/items` · `GET /api/items/categories` · `GET /api/health`

Auth admin (`requireAuth`):
- `POST /api/auth/login | logout | refresh` · `GET /api/auth/me`
- `POST /api/items` (crear) · `PATCH /api/items/:id` (editar) · `DELETE /api/items/:id`
- `PATCH /api/items/:id/disponibles` — ajuste puntual de disponibles.
- `PATCH /api/items/:id/stock` — **traspaso** disponibles ↔ en_arriendo
  (escribe ambas celdas; total constante). La auditoría registra el movimiento
  enriquecido (tipo arriendo/devolución, unidades, estado resultante).
- `GET  /api/audit` — bitácora de acciones admin.

Escritura a Sheets: celdas puntuales vía `spreadsheets.values.update/batchUpdate`
localizando la fila por la columna `id` (`writeItemCells` en
`server/src/services/sheets.js`).

## Estructura del frontend

```
client/src/
  pages/            Home, Gallery (catálogo), Contact, Social, Privacy, NotFound
  pages/admin/      Login, Dashboard (inventario), Stats (gráficos), Audit
  components/
    gallery/        CategoryMenu, ItemCard, ItemDetailModal (carrusel Embla)
    admin/          AddItemModal, ImageManagerModal, ItemFormModal
    layout/ ui/     navbar/footer, estados de carga/error, ScrollToTopButton
  hooks/            useItems, useCatalogSearch, useAuth
  lib/              api.js (fetch+CSRF), format.js, itemImages.js, imageUpload.js
```

Puntos clave del catálogo (`pages/Gallery.jsx`):
- Estado `q` (búsqueda), `category`, `subcategoria`, `sort`, sincronizados con la
  URL (`?q=&cat=&sub=&sort=`). El menú lateral es **colapsable** (`menuOpen`);
  al ocultarlo la grilla sube de columnas y las tarjetas usan `compact`.
- **Filtrado/búsqueda/orden** viven en `hooks/useCatalogSearch.js`: filtra por
  categoría+subcategoria1, luego búsqueda exacta→fuzzy (**Fuse.js**), luego
  ordena. Si cambias filtros, hazlo aquí, no dupliques lógica.
- `CategoryMenu` deriva el árbol categoría→subcategorías de `items` y notifica
  vía `onChange({category, subcategoria})`. `ItemCard` acepta `compact` y `onOpen`.

## Convenciones

- **Idioma**: código, nombres de campos y comentarios en **español**. Mantén ese
  estilo y la densidad de comentarios del archivo que edites.
- **Estética**: tema oscuro, tipografía serif en títulos (`font-display`),
  acento naranjo (`brand-*`), grises `ink-*`, badges de disponibilidad. **No
  cambies la paleta** salvo que se pida explícitamente; usa los tokens Tailwind
  existentes.
- **Stack UI**: TailwindCSS 3, `lucide-react` (íconos), `@headlessui/react`
  (Dialog/Transition), `embla-carousel-react` (carrusel), `sonner` (toasts),
  `react-hook-form` + `zod`, `recharts` (gráficos admin).
- Cambios de estado optimista en admin: debounce + revert-on-error (ver
  `Dashboard.jsx`). Escrituras a Sheets siempre mínimas (celdas puntuales).

## Git / flujo de trabajo

- Rama de desarrollo designada: **`claude/siete-rayos-rental-app-kcvg8f`**.
- Trabaja ahí, commitea con mensajes claros y abre PR **draft** hacia `main`.
- Si el PR de esa rama ya fue **fusionado**, trata el trabajo siguiente como
  nuevo: reinicia la rama desde `main` actualizado
  (`git fetch origin main && git checkout -B <rama> origin/main`) y abre un PR
  nuevo. No apiles commits sobre historia ya fusionada.
- Repo: `Omni-TI/mi-web-tecnologica`.

## Docs adicionales

- `docs/GOOGLE_SHEETS_SETUP.md` — conectar la hoja (los 3 modos).
- `docs/SECURITY.md` — auth, CSRF, rate limiting, cabeceras (helmet).
- `docs/DEPLOYMENT.md` — despliegue (client estático + server).
