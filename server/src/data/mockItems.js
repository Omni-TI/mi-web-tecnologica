/**
 * Copia del mock del cliente para que el backend pueda servirlo cuando
 * Google Sheets no está configurado (dev sin credenciales, primer arranque).
 *
 * En producción, si el backend detecta Sheets configurado, se ignora este mock
 * y todo viene de la hoja real.
 */
export const MOCK_ITEMS = [
  { id: 'A-001', nombre: 'Máquina de escribir Olivetti', categoria: 'Vintage',       subcategoria1: 'Oficina',       subcategoria2: '', valor_arriendo: 25000, cantidad_total: 3, disponibles: 2, en_arriendo: 1, imagen_url: '', fecha_creacion: '2025-01-12', activo: true },
  { id: 'A-002', nombre: 'Teléfono de disco rojo',       categoria: 'Vintage',       subcategoria1: 'Comunicación',  subcategoria2: '', valor_arriendo: 12000, cantidad_total: 4, disponibles: 4, en_arriendo: 0, imagen_url: '', fecha_creacion: '2025-01-15', activo: true },
  { id: 'A-003', nombre: 'Cámara Polaroid 600',           categoria: 'Vintage',       subcategoria1: 'Fotografía',    subcategoria2: '', valor_arriendo: 18000, cantidad_total: 2, disponibles: 1, en_arriendo: 1, imagen_url: '', fecha_creacion: '2025-02-01', activo: true },
  { id: 'B-001', nombre: 'Lámpara industrial de pie',     categoria: 'Iluminación',   subcategoria1: 'Lámparas',      subcategoria2: '', valor_arriendo: 22000, cantidad_total: 5, disponibles: 3, en_arriendo: 2, imagen_url: '', fecha_creacion: '2025-02-04', activo: true },
  { id: 'B-002', nombre: 'Luces cálidas guirnalda 10m',   categoria: 'Iluminación',   subcategoria1: 'Guirnaldas',    subcategoria2: '', valor_arriendo:  9000, cantidad_total: 8, disponibles: 8, en_arriendo: 0, imagen_url: '', fecha_creacion: '2025-02-11', activo: true },
  { id: 'B-003', nombre: 'Foco Fresnel 500W',             categoria: 'Iluminación',   subcategoria1: 'Focos',         subcategoria2: '', valor_arriendo: 35000, cantidad_total: 4, disponibles: 2, en_arriendo: 2, imagen_url: '', fecha_creacion: '2025-02-15', activo: true },
  { id: 'C-001', nombre: 'Sillón chesterfield cuero',     categoria: 'Mobiliario',    subcategoria1: 'Sillones',      subcategoria2: '', valor_arriendo: 45000, cantidad_total: 2, disponibles: 2, en_arriendo: 0, imagen_url: '', fecha_creacion: '2025-02-20', activo: true },
  { id: 'C-002', nombre: 'Mesa de madera rústica',        categoria: 'Mobiliario',    subcategoria1: 'Mesas',         subcategoria2: '', valor_arriendo: 30000, cantidad_total: 3, disponibles: 1, en_arriendo: 2, imagen_url: '', fecha_creacion: '2025-03-01', activo: true },
  { id: 'C-003', nombre: 'Silla Thonet negra',            categoria: 'Mobiliario',    subcategoria1: 'Sillas',        subcategoria2: '', valor_arriendo:  8000, cantidad_total:10, disponibles: 6, en_arriendo: 4, imagen_url: '', fecha_creacion: '2025-03-04', activo: true },
  { id: 'D-001', nombre: 'Sombrero de copa alta',         categoria: 'Vestuario',     subcategoria1: 'Sombreros',     subcategoria2: '', valor_arriendo:  6000, cantidad_total: 4, disponibles: 4, en_arriendo: 0, imagen_url: '', fecha_creacion: '2025-03-08', activo: true },
  { id: 'D-002', nombre: 'Gafas años 50',                 categoria: 'Vestuario',     subcategoria1: 'Accesorios',    subcategoria2: '', valor_arriendo:  4500, cantidad_total: 6, disponibles: 5, en_arriendo: 1, imagen_url: '', fecha_creacion: '2025-03-10', activo: true },
  { id: 'E-001', nombre: 'Máscara veneciana dorada',      categoria: 'Decoración',    subcategoria1: 'Máscaras',      subcategoria2: '', valor_arriendo:  7500, cantidad_total: 5, disponibles: 3, en_arriendo: 2, imagen_url: '', fecha_creacion: '2025-03-14', activo: true },
  { id: 'E-002', nombre: 'Jarrón cerámica azul',          categoria: 'Decoración',    subcategoria1: 'Cerámica',      subcategoria2: '', valor_arriendo:  5500, cantidad_total: 6, disponibles: 6, en_arriendo: 0, imagen_url: '', fecha_creacion: '2025-03-18', activo: true },
  { id: 'E-003', nombre: 'Cuadro barroco marco dorado',   categoria: 'Decoración',    subcategoria1: 'Cuadros',       subcategoria2: '', valor_arriendo: 15000, cantidad_total: 3, disponibles: 2, en_arriendo: 1, imagen_url: '', fecha_creacion: '2025-03-22', activo: true },
  { id: 'E-004', nombre: 'Reloj de pared antiguo',        categoria: 'Decoración',    subcategoria1: 'Relojes',       subcategoria2: '', valor_arriendo: 11000, cantidad_total: 2, disponibles: 0, en_arriendo: 2, imagen_url: '', fecha_creacion: '2025-03-25', activo: true },
]
