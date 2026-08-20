import { Link } from 'react-router-dom'
import { Zap, Mail } from 'lucide-react'
import SocialIcon from '../ui/SocialIcon.jsx'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-ink-800 bg-ink-950/60">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold text-brand-500">
            <Zap className="h-5 w-5 fill-brand-500" aria-hidden />
            <span>
              Siete<span className="text-ink-50">Rayos</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-ink-400">
            Arriendo de utilería para producciones, eventos y proyectos creativos.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-100">Explorar</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li><Link to="/catalogo" className="hover:text-brand-400">Catálogo</Link></li>
            <li><Link to="/quienes-somos" className="hover:text-brand-400">Quiénes somos</Link></li>
            <li><Link to="/mision" className="hover:text-brand-400">Misión</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-100">Contacto</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li><Link to="/contacto" className="hover:text-brand-400">Datos de contacto</Link></li>
            <li><Link to="/privacidad" className="hover:text-brand-400">Políticas de privacidad</Link></li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden /> contacto@sieterayos.example
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-100">Síguenos</h3>
          <ul className="mt-3 flex gap-3 text-ink-300">
            <li>
              <a href="#" aria-label="Instagram" className="hover:text-brand-400"><SocialIcon name="instagram" /></a>
            </li>
            <li>
              <a href="#" aria-label="Facebook" className="hover:text-brand-400"><SocialIcon name="facebook" /></a>
            </li>
            <li>
              <a href="#" aria-label="YouTube" className="hover:text-brand-400"><SocialIcon name="youtube" /></a>
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
