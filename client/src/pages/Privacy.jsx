import PlaceholderPage from '../components/ui/PlaceholderPage.jsx'

export default function Privacy() {
  return (
    <PlaceholderPage
      eyebrow="Legal"
      title="Políticas de seguridad y privacidad"
      lead="Este documento describe cómo Siete Rayos recopila, usa y protege la información de sus usuarios."
      paragraphs={[
        // Placeholder — se reemplazará con el texto legal definitivo.
        '1. Datos que recopilamos: nombre, correo, teléfono y detalles del proyecto que ingreses en el formulario de contacto. No compartimos esta información con terceros sin tu consentimiento.',
        '2. Seguridad: aplicamos medidas técnicas y organizativas para proteger los datos (cifrado en tránsito HTTPS, control de acceso, respaldos periódicos).',
        '3. Cookies: usamos cookies estrictamente necesarias para el funcionamiento del sitio y la sesión del panel de administración.',
        '4. Derechos del titular: puedes solicitar la actualización o eliminación de tus datos escribiéndonos a contacto@sieterayos.example.',
        '5. Cambios en esta política: nos reservamos el derecho de actualizarla; publicaremos la versión vigente en esta página.',
      ]}
    />
  )
}
