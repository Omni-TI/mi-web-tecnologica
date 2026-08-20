import { useState } from 'react'
import { toast } from 'sonner'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

/**
 * Formulario de contacto (placeholder).
 * En Fase 2 se conectará a un endpoint del backend con CSRF y validación.
 */
export default function Contact() {
  const [sending, setSending] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    setSending(true)
    // Simulación — Fase 2 hará POST a /api/contact
    setTimeout(() => {
      toast.success('Mensaje enviado (simulación). Nos pondremos en contacto pronto.')
      e.target.reset()
      setSending(false)
    }, 700)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-widest text-brand-500">Contacto</p>
      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Hablemos</h1>
      <p className="mt-3 max-w-2xl text-ink-300">
        Cuéntanos qué necesitas para tu proyecto y coordinamos el arriendo. Placeholder — datos ficticios.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.4fr]">
        <ul className="space-y-4 text-ink-200">
          <li className="card p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-brand-500" />
              <div>
                <div className="text-sm font-semibold">Correo</div>
                <div className="text-sm text-ink-400">contacto@sieterayos.example</div>
              </div>
            </div>
          </li>
          <li className="card p-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-brand-500" />
              <div>
                <div className="text-sm font-semibold">Teléfono</div>
                <div className="text-sm text-ink-400">+56 9 0000 0000</div>
              </div>
            </div>
          </li>
          <li className="card p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-brand-500" />
              <div>
                <div className="text-sm font-semibold">Dirección</div>
                <div className="text-sm text-ink-400">Placeholder 1234, Santiago, Chile</div>
              </div>
            </div>
          </li>
        </ul>

        <form onSubmit={onSubmit} className="card space-y-4 p-6" aria-label="Formulario de contacto">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-ink-200">Nombre</span>
              <input required name="name" type="text" className="input mt-1" autoComplete="name" />
            </label>
            <label className="block">
              <span className="text-sm text-ink-200">Correo</span>
              <input required name="email" type="email" className="input mt-1" autoComplete="email" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm text-ink-200">Asunto</span>
            <input required name="subject" type="text" className="input mt-1" />
          </label>
          <label className="block">
            <span className="text-sm text-ink-200">Mensaje</span>
            <textarea required name="message" rows={5} className="input mt-1" />
          </label>
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-500">Al enviar aceptas nuestras políticas de privacidad.</p>
            <button type="submit" className="btn-primary" disabled={sending}>
              <Send className="h-4 w-4" /> {sending ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
