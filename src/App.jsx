import React, { useState } from 'react';
import { 
  Menu, X, ChevronDown, ArrowRight, 
  Briefcase, Headphones, Cloud, Bot, 
  CheckCircle2, Shield, Zap, BarChart, 
  PlayCircle 
} from 'lucide-react';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* NAVEGACIÓN */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Tech<span className="text-blue-600">Partner</span></span>
            </div>

            {/* Menú Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="group relative cursor-pointer py-8">
                <span className="flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  Servicios <ChevronDown className="ml-1 w-4 h-4 group-hover:rotate-180 transition-transform duration-200" />
                </span>
                {/* Mega Menu Simulado */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white shadow-xl rounded-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-6 grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estrategia & Operaciones</h4>
                    <a href="#" className="flex flex-col hover:bg-slate-50 p-2 rounded-lg transition-colors">
                      <span className="font-semibold text-sm text-slate-900">Partner Tecnológico</span>
                      <span className="text-xs text-slate-500">Consultoría y transformación digital</span>
                    </a>
                    <a href="#" className="flex flex-col hover:bg-slate-50 p-2 rounded-lg transition-colors">
                      <span className="font-semibold text-sm text-slate-900">Soporte TI 24/7</span>
                      <span className="text-xs text-slate-500">Mesa de ayuda y mantenimiento</span>
                    </a>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tecnología Avanzada</h4>
                    <a href="#" className="flex flex-col hover:bg-slate-50 p-2 rounded-lg transition-colors">
                      <span className="font-semibold text-sm text-slate-900">Infraestructura & Nube</span>
                      <span className="text-xs text-slate-500">Migración Cloud y Ciberseguridad</span>
                    </a>
                    <a href="#" className="flex flex-col hover:bg-slate-50 p-2 rounded-lg transition-colors">
                      <span className="font-semibold text-sm text-slate-900">Automatización e IA</span>
                      <span className="text-xs text-slate-500">RPA, Low-Code e IA Generativa</span>
                    </a>
                  </div>
                </div>
              </div>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Casos de Uso</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Cómo Funciona</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Nosotros</a>
            </div>

            {/* CTA Desktop */}
            <div className="hidden md:flex items-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50">
                Agendar Consultoría
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-xl absolute w-full">
            <a href="#" className="block px-3 py-2 text-base font-medium text-slate-900 bg-slate-50 rounded-lg">Servicios</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-slate-600">Casos de Uso</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-slate-600">Cómo Funciona</a>
            <button className="w-full mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium">
              Agendar Consultoría
            </button>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-24 pb-32">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" /> Evoluciona tu empresa hoy
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Tu aliado integral para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">escalar, proteger y automatizar</span> tu negocio.
              </h1>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Unificamos consultoría estratégica, soporte técnico de clase mundial y tecnología de vanguardia (Cloud & IA) para impulsar tu transformación digital sin fricciones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-full font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20">
                  Explorar Servicios <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 rounded-full font-semibold transition-all flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600">
                  <PlayCircle className="w-5 h-5 text-blue-400" /> Ver Demo (2 min)
                </button>
              </div>
            </div>
            
            {/* Visual Header Illustration (Abstract Tech) */}
            <div className="hidden lg:block relative h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl border border-white/10 backdrop-blur-sm p-6 flex flex-col gap-4 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex gap-4 items-center border-b border-white/10 pb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="h-4 w-32 bg-white/20 rounded mb-2"></div>
                    <div className="h-3 w-20 bg-white/10 rounded"></div>
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-slate-800/50 border border-white/5 p-4 flex gap-4">
                  <div className="w-1/3 rounded-lg bg-blue-500/20 flex items-center justify-center">
                     <Bot className="w-8 h-8 text-blue-400 opacity-50" />
                  </div>
                  <div className="w-2/3 space-y-3">
                     <div className="h-3 w-full bg-white/10 rounded"></div>
                     <div className="h-3 w-5/6 bg-white/10 rounded"></div>
                     <div className="h-3 w-4/6 bg-blue-400/30 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF (Logos) */}
      <section className="py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-500 mb-6 uppercase tracking-wider">Tecnologías y Partners de confianza</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Simulación de logos de partners (AWS, Microsoft, UiPath, etc.) */}
            <div className="flex items-center gap-2 font-bold text-xl"><Cloud className="w-6 h-6"/> CloudOps</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Shield className="w-6 h-6"/> SecurIT</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Bot className="w-6 h-6"/> AutoBot AI</div>
            <div className="flex items-center gap-2 font-bold text-xl"><BarChart className="w-6 h-6"/> DataFlow</div>
          </div>
        </div>
      </section>

      {/* SERVICIOS MATRIZ */}
      <section className="py-24 bg-slate-50" id="servicios">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Un ecosistema de soluciones para tu negocio</h2>
            <p className="text-lg text-slate-600">No contrates múltiples proveedores. Centralizamos tu estrategia, infraestructura y soporte en un solo lugar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Tarjeta 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Partner Tecnológico</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Consultoría estratégica. Diseñamos la hoja de ruta digital alineada a tus objetivos de negocio y KPIs.
              </p>
              <a href="#" className="inline-flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Saber más <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Headphones className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Soporte TI 24/7</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Mesa de ayuda, gestión de incidencias y mantenimiento preventivo para que tu operación nunca se detenga.
              </p>
              <a href="#" className="inline-flex items-center text-emerald-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Saber más <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cloud className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Infraestructura & Nube</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Migración a AWS/Azure, arquitecturas escalables, gestión de redes y ciberseguridad avanzada.
              </p>
              <a href="#" className="inline-flex items-center text-cyan-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Saber más <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            {/* Tarjeta 4 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Automatización e IA</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Implementación de RPA, desarrollo Low-Code e IA Generativa para eliminar tareas manuales repetitivas.
              </p>
              <a href="#" className="inline-flex items-center text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
                Saber más <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS / CÓMO FUNCIONA */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">De la estrategia a la ejecución, sin interrupciones.</h2>
              <p className="text-lg text-slate-600 mb-8">
                Nuestro enfoque metodológico garantiza que cada inversión tecnológica que realices tenga un retorno claro (ROI) y sea adoptada fácilmente por tu equipo.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">1. Auditoría Tecnológica</h4>
                    <p className="text-slate-600 text-sm mt-1">Evaluamos tu infraestructura actual y detectamos cuellos de botella.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">2. Diseño de Solución</h4>
                    <p className="text-slate-600 text-sm mt-1">Proponemos arquitecturas Cloud o flujos RPA a medida.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">3. Implementación & Soporte</h4>
                    <p className="text-slate-600 text-sm mt-1">Desplegamos la tecnología y brindamos mesa de ayuda continua.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Calculadora ROI / Dashboard Mockup */}
            <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
              <h3 className="text-white font-bold text-xl mb-6">Impacto Promedio de Automatización</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2 text-slate-300">
                    <span>Reducción de Tiempo en Tareas Manuales</span>
                    <span className="text-blue-400 font-bold">75%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2 text-slate-300">
                    <span>Disponibilidad de Sistemas (SLA)</span>
                    <span className="text-emerald-400 font-bold">99.9%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{width: '99.9%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2 text-slate-300">
                    <span>Ahorro en Costos Operativos</span>
                    <span className="text-purple-400 font-bold">40%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{width: '40%'}}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-sm text-slate-400 text-center">Calcula el ROI para tu empresa en nuestra <a href="#" className="text-blue-400 hover:underline">Calculadora Interactiva</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION FINAL */}
      <section className="bg-blue-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">¿Listo para transformar tu operación?</h2>
          <p className="text-blue-100 text-lg mb-10">Agenda una sesión de diagnóstico de 30 minutos sin costo con uno de nuestros arquitectos de soluciones.</p>
          <form className="max-w-md mx-auto bg-white p-2 rounded-full flex shadow-xl">
            <input 
              type="email" 
              placeholder="Tu correo corporativo" 
              className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-800 placeholder-slate-400"
            />
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-medium transition-colors">
              Comenzar
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="text-blue-500 w-6 h-6" />
              <span className="font-bold text-xl text-white">TechPartner</span>
            </div>
            <p className="text-sm">Haciendo la tecnología empresarial accesible, segura y automática.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Consultoría TI</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Soporte y Mesa de Ayuda</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Cloud & Seguridad</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">RPA & Inteligencia Artificial</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Casos de Éxito</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Nosotros</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Blog & Recursos</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Términos de Servicio</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
          &copy; {new Date().getFullYear()} TechPartner. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}