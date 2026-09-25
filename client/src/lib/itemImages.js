/**
 * Origen de las imágenes de un artículo.
 *
 * ⚠️ PLACEHOLDER: por ahora genera imágenes de relleno offline (SVG data-URI)
 * que varían por categoría (color) y por artículo (cantidad 1–3). Cuando exista
 * almacenamiento real (p. ej. ImageKit), este helper ya devuelve primero
 * `item.imagenes` si viene poblado — sólo habrá que poblar ese campo con URLs
 * reales, sin tocar el carrusel ni las tarjetas.
 */

const CAT_COLORS = {
  'Vintage':      ['#7c2d12', '#b45309'],
  'Iluminación':  ['#0c4a6e', '#0ea5e9'],
  'Mobiliario':   ['#78350f', '#d97706'],
  'Vestuario':    ['#3730a3', '#6366f1'],
  'Decoración':   ['#164e63', '#14b8a6'],
}
const DEFAULT_COLORS = ['#292524', '#57534e']

function colorsFor(cat) {
  return CAT_COLORS[cat] || DEFAULT_COLORS
}

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function esc(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function svgDataUri({ c1, c2, title, sub, idx, total }) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>` +
    `</linearGradient></defs>` +
    `<rect width="800" height="600" fill="url(#g)"/>` +
    `<text x="48" y="90" font-family="system-ui,sans-serif" font-size="28" fill="#ffffff" opacity="0.85">${esc(sub)}</text>` +
    `<text x="48" y="320" font-family="system-ui,sans-serif" font-size="52" font-weight="700" fill="#ffffff">${esc(title)}</text>` +
    `<text x="48" y="560" font-family="system-ui,sans-serif" font-size="24" fill="#ffffff" opacity="0.7">Imagen ${idx} de ${total} · placeholder</text>` +
    `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** Cantidad de imágenes placeholder (1–3), determinística por artículo. */
function placeholderCount(item) {
  return (hashStr(item.id || item.nombre || 'x') % 3) + 1
}

/**
 * Props <img> optimizadas para una URL real (ImageKit): entrega responsive
 * (`srcset`) con formato/calidad automáticos (WebP/AVIF). Para placeholders
 * (data-URI SVG) o URLs no-http devuelve `{ src }` tal cual, sin transformar.
 *
 * @param {string} url
 * @param {{ widths?: number[], sizes?: string }} [opts]
 * @returns {{ src: string, srcSet?: string, sizes?: string }}
 */
export function imageProps(url, { widths = [400, 800, 1200], sizes } = {}) {
  if (!url || !/^https?:\/\//i.test(url)) return { src: url }
  const tr = (w) => `${url}${url.includes('?') ? '&' : '?'}tr=w-${w},f-auto,q-auto`
  const props = {
    // `src` de respaldo: un tamaño intermedio para navegadores sin srcset.
    src: tr(widths[Math.min(1, widths.length - 1)]),
    srcSet: widths.map((w) => `${tr(w)} ${w}w`).join(', '),
  }
  if (sizes) props.sizes = sizes
  return props
}

/**
 * Devuelve el arreglo de URLs de imágenes del artículo (máx. 3).
 *
 * @param {object} item
 * @returns {string[]}
 */
export function getItemImages(item) {
  if (!item) return []
  // Cuando el almacenamiento real esté conectado, `item.imagenes` traerá las
  // URLs reales y este bloque las usa directamente (sin más cambios):
  if (Array.isArray(item.imagenes) && item.imagenes.length > 0) {
    return item.imagenes.slice(0, 3)
  }
  // Compatibilidad con el campo antiguo de una sola imagen.
  if (item.imagen_url) return [item.imagen_url]

  // Fallback: placeholders offline.
  const [c1, c2] = colorsFor(item.categoria)
  const total = placeholderCount(item)
  return Array.from({ length: total }, (_, i) =>
    svgDataUri({ c1, c2, title: item.nombre, sub: item.categoria, idx: i + 1, total }),
  )
}
