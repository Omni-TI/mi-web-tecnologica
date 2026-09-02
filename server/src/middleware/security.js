/**
 * Helmet endurecido para producción:
 *   - CSP estricta: solo self + Google Fonts (usadas por index.html).
 *   - HSTS con includeSubDomains y preload.
 *   - Referrer-Policy, X-Frame-Options, X-Content-Type-Options, etc. (defaults).
 *
 * En dev usamos las defaults más laxas para no romper HMR de Vite.
 */
import helmet from 'helmet'
import { config } from '../config/env.js'

export function securityHeaders() {
  if (config.env !== 'production') {
    return helmet()
  }

  return helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'style-src': ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"], // CSS inline mínimo (Tailwind)
        'script-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        'upgrade-insecure-requests': [],
      },
    },
    strictTransportSecurity: {
      maxAge: 63072000, // 2 años
      includeSubDomains: true,
      preload: true,
    },
    crossOriginEmbedderPolicy: false, // permite fuentes google externas
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
}
