/**
 * Subida de imágenes de artículo a ImageKit (subida FIRMADA).
 *
 * Flujo seguro:
 *   1. Pedimos a nuestro backend una firma de un solo uso (`/api/uploads/auth`,
 *      solo admin). La clave privada NUNCA llega al navegador.
 *   2. Subimos el archivo DIRECTO a ImageKit con esa firma (no pasa por nuestro
 *      servidor → rápido y sin gastar su ancho de banda).
 *   3. Devolvemos las URLs públicas resultantes para persistirlas en el artículo.
 *
 * ImageKit exige un token único por subida, por eso pedimos una firma por archivo.
 */
import { api } from './api.js'

export const MIN_IMAGENES = 1
export const MAX_IMAGENES = 3

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload'

/**
 * Sube las imágenes y devuelve sus URLs públicas (en el mismo orden).
 * @param {File[]} archivos
 * @returns {Promise<string[]>}
 */
export async function subirImagenes(archivos) {
  if (!archivos || archivos.length === 0) return []

  const urls = []
  for (const file of archivos) {
    // Firma de un solo uso por archivo (503 si el alojamiento no está configurado).
    const auth = await api.getUploadAuth()

    const maxMb = auth.maxUploadMb || 5
    if (file.size > maxMb * 1024 * 1024) {
      throw new Error(`«${file.name}» supera el máximo de ${maxMb} MB.`)
    }

    const form = new FormData()
    form.append('file', file)
    form.append('fileName', file.name)
    form.append('publicKey', auth.publicKey)
    form.append('token', auth.token)
    form.append('expire', String(auth.expire))
    form.append('signature', auth.signature)
    if (auth.folder) form.append('folder', auth.folder)
    form.append('useUniqueFileName', 'true')

    const res = await fetch(IMAGEKIT_UPLOAD_URL, { method: 'POST', body: form })
    if (!res.ok) {
      let msg = `Falló la subida a ImageKit (HTTP ${res.status}).`
      try { const j = await res.json(); if (j?.message) msg += ` ${j.message}` } catch { /* noop */ }
      throw new Error(msg)
    }
    const data = await res.json()
    if (!data?.url) throw new Error('ImageKit no devolvió la URL de la imagen.')
    urls.push(data.url)
  }
  return urls
}
