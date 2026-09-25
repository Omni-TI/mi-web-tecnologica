/**
 * Alojamiento de imágenes: subida FIRMADA a ImageKit.
 *
 * La clave privada NUNCA sale del servidor: solo se usa aquí para firmar los
 * parámetros de subida. El navegador (panel admin) recibe token/expire/signature
 * + la clave pública y sube el archivo DIRECTO a ImageKit (no pasa por este
 * backend → rápido y sin gastar su ancho de banda).
 *
 * token/expire/signature son de un solo uso: ImageKit evita el replay.
 */
import crypto from 'node:crypto'

import { config } from '../config/env.js'

/**
 * Genera los parámetros de subida firmada.
 * Lanza 503 si el alojamiento no está configurado (faltan las llaves).
 */
export function getUploadAuthParams() {
  const { imagekitPublicKey, imagekitPrivateKey, imagekitFolder } = config.images
  if (!imagekitPublicKey || !imagekitPrivateKey) {
    const e = new Error(
      'El alojamiento de imágenes no está configurado. Define IMAGEKIT_PUBLIC_KEY ' +
      'e IMAGEKIT_PRIVATE_KEY en server/.env (ver docs/IMAGES.md).',
    )
    e.status = 503
    throw e
  }
  const token = crypto.randomUUID()
  // La expiración debe ser < 1 hora en el futuro. Usamos 10 minutos.
  const expire = Math.floor(Date.now() / 1000) + 600
  const signature = crypto
    .createHmac('sha1', imagekitPrivateKey)
    .update(token + expire)
    .digest('hex')

  return {
    token,
    expire,
    signature,
    publicKey: imagekitPublicKey,
    folder: imagekitFolder,
    maxUploadMb: config.images.maxUploadMb,
  }
}
