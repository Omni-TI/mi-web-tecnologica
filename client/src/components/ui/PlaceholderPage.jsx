/**
 * Componente reutilizable para páginas informativas placeholder.
 * Uniforma la tipografía y el layout; el contenido real llegará después.
 */
export default function PlaceholderPage({ eyebrow, title, lead, paragraphs = [] }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      {eyebrow && (
        <p className="text-xs uppercase tracking-widest text-brand-500">{eyebrow}</p>
      )}
      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
      {lead && <p className="mt-4 text-lg text-ink-200">{lead}</p>}
      <div className="prose prose-invert mt-6 max-w-none">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-ink-300 leading-relaxed">
            {p}
          </p>
        ))}
      </div>
      <p className="mt-10 rounded-md border border-dashed border-ink-700 bg-ink-900/40 p-3 text-xs text-ink-500">
        Contenido placeholder — se sustituirá con el texto definitivo en fases posteriores.
      </p>
    </article>
  )
}
