import SocialIcon from '../components/ui/SocialIcon.jsx'

const CHANNELS = [
  { name: 'Instagram', href: '#', icon: 'instagram', handle: '@sieterayos' },
  { name: 'Facebook',  href: '#', icon: 'facebook',  handle: 'facebook.com/sieterayos' },
  { name: 'YouTube',   href: '#', icon: 'youtube',   handle: 'youtube.com/@sieterayos' },
  { name: 'TikTok',    href: '#', icon: 'tiktok',    handle: '@sieterayos' },
  { name: 'LinkedIn',  href: '#', icon: 'linkedin',  handle: 'linkedin.com/company/sieterayos' },
]

export default function Social() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-widest text-brand-500">Redes sociales</p>
      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Conecta con nosotros</h1>
      <p className="mt-3 max-w-2xl text-ink-300">
        Encuéntranos en nuestras redes para inspiración, novedades y detrás de escena. (Enlaces placeholder.)
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHANNELS.map((c) => (
          <li key={c.name}>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-4 p-4 transition-colors hover:border-brand-500/60"
              aria-label={`Abrir ${c.name}`}
            >
              <div className="rounded-lg bg-brand-600/10 p-3 text-brand-400 ring-1 ring-brand-500/30">
                <SocialIcon name={c.icon} className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-ink-400">{c.handle}</div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
