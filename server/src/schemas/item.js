import { z } from 'zod'

/**
 * Esquemas compartidos.
 *
 * Regla del negocio (solo en ESCRITURA admin): disponibles + en_arriendo <= cantidad_total.
 * Es una desigualdad, no una igualdad: se permite que algunas unidades no estén
 * ni disponibles ni arrendadas (p. ej. en reparación o reservadas), pero nunca
 * "inventar" unidades que no existen físicamente.
 * En LECTURA desde la hoja usamos un mapeo tolerante (ver services/sheets.js):
 * los datos reales pueden no cuadrar exactamente y no queremos descartar filas.
 *
 * Nota: ZodObject.omit/partial NO están disponibles tras `.refine()`, por eso
 * mantenemos primero el objeto plano y añadimos el refinamiento aparte.
 */
const balanceRefine = (v) => v.disponibles + v.en_arriendo <= v.cantidad_total
const balanceMsg = {
  message: 'disponibles + en_arriendo no puede superar cantidad_total',
  path: ['cantidad_total'],
}

const ItemBase = z.object({
  id: z.string().trim().min(1),
  nombre: z.string().trim().min(1).max(160),
  categoria: z.string().trim().min(1).max(80),
  subcategoria1: z.string().trim().max(80).default(''),
  subcategoria2: z.string().trim().max(80).default(''),
  valor_arriendo: z.number().int().nonnegative(),
  cantidad_total: z.number().int().nonnegative(),
  disponibles: z.number().int().nonnegative(),
  en_arriendo: z.number().int().nonnegative(),
  imagen_url: z.string().url().or(z.literal('')).default(''),
  fecha_creacion: z.string().default(''),
  activo: z.boolean().default(true),
})

export const ItemSchema = ItemBase.refine(balanceRefine, balanceMsg)

export const ItemCreateSchema = ItemBase
  .omit({ id: true, fecha_creacion: true })
  .partial({ activo: true, subcategoria1: true, subcategoria2: true })
  .refine(balanceRefine, balanceMsg)

export const ItemUpdateSchema = ItemBase
  .omit({ id: true, fecha_creacion: true })
  .partial()

/**
 * Ajuste puntual de unidades disponibles (control +/- del panel admin).
 * El límite superior (disponibles <= cantidad_total - en_arriendo) se valida
 * en el servicio, porque depende del estado actual del item en la hoja.
 */
export const DisponiblesSchema = z.object({
  disponibles: z.number().int().nonnegative(),
})
