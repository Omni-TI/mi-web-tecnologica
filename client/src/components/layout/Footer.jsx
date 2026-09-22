import { Link } from 'react-router-dom'
import { Zap, Mail, Phone, MapPin, Clock, FileText, ExternalLink } from 'lucide-react'
import SocialIcon from '../ui/SocialIcon.jsx'

/**
 * Pie de página del sitio (global, aparece en todas las páginas públicas).
 *
 * ▸ DATOS PLACEHOLDER: reemplaza las constantes de abajo por los reales.
 *   - CONTACT.address / mapUrl : dirección física y enlace a Google Maps.
 *   - CONTACT.hours            : horarios de retiro y devolución.
 *   - CONTACT.phone / email    : contacto.
 *   - CONTACT.socials          : URLs de redes.
 *   - TERMS_URL                : página o PDF de términos y condiciones.
 */
const CONTACT = {
  address: 'Av. Siempre Viva 1234, Providencia, Santiago',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Providencia+Santiago+Chile',
  hours: {
    retiro: 'Lun a Vie · 9:00–18:00 · Sáb 10:00–14:00',
    devolucion: 'Lun a Vie · 9:00–18:00',
  },
  phone: '+56 9 1234 5678',
  phoneHref: 'tel:+56912345678',
  email: 'contacto@sieterayos.example',
  socials: {
    instagram: '#',
    facebook: '#',
    youtube: '#',
  },
}
// TODO: apuntar a la página/PDF real de términos y condiciones del arriendo.
const TERMS_URL = '#'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-ink-800 bg-ink-950/60">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {/* Marca + dirección */}
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold text-brand-500">
            <Zap className="h-5 w-5 fill-brand-500" aria-hidden />
            <span>
              Siete<span className="text-ink-50">Rayos</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-ink-400">
            Arriendo de utilería y decoración para producciones, eventos y proyectos creativos.
          </p>
          <div className="mt-4 flex items-start gap-2 text-sm text-ink-300">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden />
            <div>
              <p>{CONTACT.address}</p>
              <a
                href={CONTACT.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-brand-400 hover:underline"
              >
                Ver en el mapa <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-100">
            <Clock className="h-4 w-4 text-brand-400" aria-hidden /> Horarios
          </h3>
          <dl className="mt-3 space-y-3 text-sm text-ink-300">
            <div>
              <dt className="text-ink-400">Retiro de utilería</dt>
              <dd>{CONTACT.hours.retiro}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Devolución</dt>
              <dd>{CONTACT.hours.devolucion}</dd>
            </div>
          </dl>
        </div>

        {/* Enlaces */}
        <div>
          <h3 className="text-sm font-semibold text-ink-100">Explorar</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li><Link to="/catalogo" className="hover:text-brand-400">Catálogo</Link></li>
            <li><Link to="/redes" className="hover:text-brand-400">Redes sociales</Link></li>
            <li><Link to="/contacto" className="hover:text-brand-400">Contacto</Link></li>
            <li>
              <a href={TERMS_URL} className="inline-flex items-center gap-1 hover:text-brand-400">
                <FileText className="h-3.5 w-3.5" aria-hidden /> Términos y condiciones
              </a>
            </li>
            <li><Link to="/privacidad" className="hover:text-brand-400">Políticas de privacidad</Link></li>
          </ul>
        </div>

        {/* Contacto + redes */}
        <div>
          <h3 className="text-sm font-semibold text-ink-100">Contacto</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li>
              <a href={CONTACT.phoneHref} className="flex items-center gap-2 hover:text-brand-400">
                <Phone className="h-4 w-4" aria-hidden /> {CONTACT.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-brand-400">
                <Mail className="h-4 w-4" aria-hidden /> {CONTACT.email}
              </a>
            </li>
          </ul>
          <h3 className="mt-5 text-sm font-semibold text-ink-100">Síguenos</h3>
          <ul className="mt-3 flex gap-3 text-ink-300">
            <li>
              <a href={CONTACT.socials.instagram} aria-label="Instagram" className="hover:text-brand-400"><SocialIcon name="instagram" /></a>
            </li>
            <li>
              <a href={CONTACT.socials.facebook} aria-label="Facebook" className="hover:text-brand-400"><SocialIcon name="facebook" /></a>
            </li>
            <li>
              <a href={CONTACT.socials.youtube} aria-label="YouTube" className="hover:text-brand-400"><SocialIcon name="youtube" /></a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800 py-4 text-center text-xs text-ink-500">
        © {year} Siete Rayos · Todos los derechos reservados
      </div>
    </footer>
  )
}
