import { Routes, Route, Navigate } from 'react-router-dom'

import PublicLayout from './components/layout/PublicLayout.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import AuthGuard from './components/admin/AuthGuard.jsx'

import Home from './pages/Home.jsx'
import Gallery from './pages/Gallery.jsx'
import About from './pages/About.jsx'
import Mission from './pages/Mission.jsx'
import Social from './pages/Social.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import NotFound from './pages/NotFound.jsx'

import AdminLogin from './pages/admin/Login.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'

export default function App() {
  return (
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
          </Route>
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
