/**
 * Datos de prueba para desarrollo de la Fase 1.
 * En Fase 2 estos serán reemplazados por llamadas al backend
 * que a su vez leerá desde Google Sheets.
 *
 * Estructura alineada con la hoja `items` definida en la especificación.
 */
export const MOCK_ITEMS = [
  { id: 'A-001', nombre: 'Máquina de escribir Olivetti', categoria: 'Vintage',       valor_arriendo: 25000, cantidad_total: 3, disponibles: 2, en_arriendo: 1, imagen_url: '', fecha_creacion: '2025-01-12' },
  { id: 'A-002', nombre: 'Teléfono de disco rojo',       categoria: 'Vintage',       valor_arriendo: 12000, cantidad_total: 4, disponibles: 4, en_arriendo: 0, imagen_url: '', fecha_creacion: '2025-01-15' },
  { id: 'A-003', nombre: 'Cámara Polaroid 600',           categoria: 'Vintage',       valor_arriendo: 18000, cantidad_total: 2, disponibles: 1, en_arriendo: 1, imagen_url: '', fecha_creacion: '2025-02-01' },

  { id: 'B-001', nombre: 'Lámpara industrial de pie',     categoria: 'Iluminación',   valor_arriendo: 22000, cantidad_total: 5, disponibles: 3, en_arriendo: 2, imagen_url: '', fecha_creacion: '2025-02-04' },
  { id: 'B-002', nombre: 'Luces cálidas guirnalda 10m',   categoria: 'Iluminación',   valor_arriendo:  9000, cantidad_total: 8, disponibles: 8, en_arriendo: 0, imagen_url: '', fecha_creacion: '2025-02-11' },
  { id: 'B-003', nombre: 'Foco Fresnel 500W',             categoria: 'Iluminación',   valor_arriendo: 35000, cantidad_total: 4, disponibles: 2, en_arriendo: 2, imagen_url: '', fecha_creacion: '2025-02-15' },

  { id: 'C-001', nombre: 'Sillón chesterfield cuero',     categoria: 'Mobiliario',    valor_arriendo: 45000, cantidad_total: 2, disponibles: 2, en_arriendo: 0, imagen_url: '', fecha_creacion: '2025-02-20' },
  { id: 'C-002', nombre: 'Mesa de madera rústica',        categoria: 'Mobiliario',    valor_arriendo: 30000, cantidad_total: 3, disponibles: 1, en_arriendo: 2, imagen_url: '', fecha_creacion: '2025-03-01' },
  { id: 'C-003', nombre: 'Silla Thonet negra',            categoria: 'Mobiliario',    valor_arriendo:  8000, cantidad_total:10, disponibles: 6, en_arriendo: 4, imagen_url: '', fecha_creacion: '2025-03-04' },

  { id: 'D-001', nombre: 'Sombrero de copa alta',         categoria: 'Vestuario',     valor_arriendo:  6000, cantidad_total: 4, disponibles: 4, en_arriendo: 0, imagen_url: '', fecha_creacion: '2025-03-08' },
  { id: 'D-002', nombre: 'Gafas años 50',                 categoria: 'Vestuario',     valor_arriendo:  4500, cantidad_total: 6, disponibles: 5, en_arriendo: 1, imagen_url: '', fecha_creacion: '2025-03-10' },

  { id: 'E-001', nombre: 'Máscara veneciana dorada',      categoria: 'Decoración',    valor_arriendo:  7500, cantidad_total: 5, disponibles: 3, en_arriendo: 2, imagen_url: '', fecha_creacion: '2025-03-14' },
  { id: 'E-002', nombre: 'Jarrón cerámica azul',          categoria: 'Decoración',    valor_arriendo:  5500, cantidad_total: 6, disponibles: 6, en_arriendo: 0, imagen_url: '', fecha_creacion: '2025-03-18' },
  { id: 'E-003', nombre: 'Cuadro barroco marco dorado',   categoria: 'Decoración',    valor_arriendo: 15000, cantidad_total: 3, disponibles: 2, en_arriendo: 1, imagen_url: '', fecha_creacion: '2025-03-22' },
  { id: 'E-004', nombre: 'Reloj de pared antiguo',        categoria: 'Decoración',    valor_arriendo: 11000, cantidad_total: 2, disponibles: 0, en_arriendo: 2, imagen_url: '', fecha_creacion: '2025-03-25' },
]

/** Formatea un número CLP (por ejemplo: 25000 → "$25.000"). */
export function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}
