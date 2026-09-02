import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

/**
 * Layout público — envuelve todas las páginas visibles a clientes.
 * La barra de búsqueda vive en la Navbar (siempre visible arriba).
 */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-900 text-ink-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
