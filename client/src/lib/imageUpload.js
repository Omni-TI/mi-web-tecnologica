/**
 * Subida de imágenes de artículo — PUNTO DE INTEGRACIÓN.
 *
 * ⚠️ Por ahora NO sube nada a ningún servicio externo: sólo genera vistas
 * previas locales con `URL.createObjectURL`, para que el flujo del panel se
 * sienta completo. La estructura está aislada aquí a propósito.
 *
 * Cuando se defina el proveedor (probablemente ImageKit), SÓLO hay que
 * reemplazar el cuerpo de `subirImagenes` por la subida real y devolver las
 * URLs públicas resultantes. El resto del panel (validaciones, miniaturas,
 * reordenamiento) no cambia.
 */

export const MIN_IMAGENES = 1
export const MAX_IMAGENES = 3

/**
 * "Sube" las imágenes y devuelve sus URLs.
 *
 * @param {File[]} archivos  Archivos elegidos por el usuario.
 * @returns {Promise<string[]>} URLs de las imágenes (por ahora, object URLs locales).
 */
export async function subirImagenes(archivos) {
  // TODO: reemplazar por subida real a servicio de almacenamiento (pendiente de
  // definir, p. ej. ImageKit). Ejemplo del cambio acotado que habrá que hacer:
  //
  //   const subidas = await Promise.all(
  //     archivos.map((f) => imagekit.upload({ file: f, fileName: f.name })),
  //   )
  //   return subidas.map((r) => r.url)
  //
  // Mientras tanto, devolvemos previews locales:
  return archivos.map((f) => URL.createObjectURL(f))
}
