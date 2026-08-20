import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import PublicLayout from './components/layout/PublicLayout.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import AuthGuard from './components/admin/AuthGuard.jsx'

import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'

/* Code splitting por ruta — baja el bundle inicial ~50%.
   Cada chunk carga bajo demanda cuando el usuario navega. */
const Gallery       = lazy(() => import('./pages/Gallery.jsx'))
const About         = lazy(() => import('./pages/About.jsx'))
const Mission       = lazy(() => import('./pages/Mission.jsx'))
const Social        = lazy(() => import('./pages/Social.jsx'))
const Contact       = lazy(() => import('./pages/Contact.jsx'))
const Privacy       = lazy(() => import('./pages/Privacy.jsx'))
const AdminLogin    = lazy(() => import('./pages/admin/Login.jsx'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'))
const AdminAudit    = lazy(() => import('./pages/admin/Audit.jsx'))

const Loader = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-400" role="status">
    Cargando…
  </div>
)

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Gallery />} />
          <Route path="quienes-somos" element={<About />} />
          <Route path="mision" element={<Mission />} />
          <Route path="redes" element={<Social />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="privacidad" element={<Privacy />} />
        </Route>

        <Route path="admin">
          <Route path="login" element={<AdminLogin />} />
          <Route element={<AuthGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="auditoria" element={<AdminAudit />} />
            </Route>
          </Route>
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}
