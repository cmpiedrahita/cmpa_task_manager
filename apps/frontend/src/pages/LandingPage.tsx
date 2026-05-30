import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const FEATURES = [
  { icon: "📊", title: "Dashboard Inteligente", desc: "Visualiza el progreso de todos tus proyectos con gráficos en tiempo real y métricas clave." },
  { icon: "✅", title: "Gestión de Tareas", desc: "Crea, asigna y prioriza tareas con fechas límite, etiquetas y niveles de prioridad." },
  { icon: "🗂️", title: "Vista Kanban", desc: "Arrastra y suelta tareas entre columnas para gestionar el flujo de trabajo visualmente." },
  { icon: "📄", title: "Reportes PDF", desc: "Exporta reportes detallados de tus proyectos y tareas con un solo clic." },
  { icon: "🔒", title: "Acceso Seguro", desc: "Autenticación JWT con refresh tokens y control de roles para tu equipo." },
];

const COMPANIES = ["GoPass", "Acme Corp", "Vercel Inc", "Stripe", "Linear", "Notion"];

export default function LandingPage() {
  const token = useAuthStore((s) => s.accessToken);
  const navigate = useNavigate();

  if (token) return <Navigate to="/projects" replace />;

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">CMPA</span>
          <div className="hidden md:flex items-center gap-6">
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="text-sm text-gray-300 hover:text-white transition-colors">
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 font-medium transition-all"
            >
              Comenzar gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen pt-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-medium px-4 py-1.5 rounded-full">
              Gestión de proyectos moderna
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Gestiona tus proyectos.{" "}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Organiza tus tareas.
              </span>{" "}
              Alcanza más.
            </h1>
            <p className="text-lg text-gray-400 max-w-md">
              La plataforma todo-en-uno para equipos que quieren moverse rápido. Kanban, dashboards, reportes y colaboración en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 font-semibold transition-all shadow-lg shadow-violet-500/25"
              >
                Comenzar gratis →
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 font-medium transition-all"
              >
                Iniciar sesión
              </button>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-blue-600/20 rounded-3xl blur-3xl" />
            <div className="relative w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl shadow-violet-500/10 overflow-hidden p-2">
              <img
                src="/background.png"
                alt="CMPA Task Manager"
                className="w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Companies */}
      <section className="py-12 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">Utilizado por equipos de las mejores empresas</p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {COMPANIES.map((c) => (
              <span key={c} className="text-gray-500 font-semibold text-sm tracking-widest uppercase hover:text-gray-300 transition-colors">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Todo lo que necesitas para{" "}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                trabajar mejor
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Herramientas diseñadas para equipos modernos que buscan claridad, velocidad y resultados.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {FEATURES.slice(0, 3).map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
            {FEATURES.slice(3).map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden p-12 text-center bg-gradient-to-br from-violet-900/50 to-blue-900/50 border border-violet-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-blue-600/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">Empieza hoy, gratis</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Sin tarjeta de crédito. Sin límites artificiales. Solo tú y tu equipo construyendo cosas increíbles.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 font-semibold text-lg transition-all shadow-lg shadow-violet-500/25"
              >
                Crear cuenta gratis →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <span className="font-bold text-lg">CMPA</span>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              La plataforma de gestión de proyectos para equipos modernos.
            </p>
            <div className="flex gap-3 mt-4">
              {["𝕏", "in", "gh"].map((s) => (
                <a key={s} href="#" className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors text-xs font-bold">
                  {s}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-4">Producto</p>
            {["Características", "Precios", "Changelog", "Roadmap"].map((l) => (
              <a key={l} href="#" className="block text-sm text-gray-500 hover:text-white transition-colors mb-2">{l}</a>
            ))}
          </div>
          <div>
            <p className="font-semibold text-sm mb-4">Recursos</p>
            {["Documentación", "API Reference", "Blog", "Soporte"].map((l) => (
              <a key={l} href="#" className="block text-sm text-gray-500 hover:text-white transition-colors mb-2">{l}</a>
            ))}
          </div>
          <div>
            <p className="font-semibold text-sm mb-4">Newsletter</p>
            <p className="text-sm text-gray-500 mb-3">Recibe novedades y tips de productividad.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-500 transition-colors"
              />
              <button className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium transition-colors">
                →
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2024 CMPA Task Manager. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            {["Privacidad", "Términos", "Cookies"].map((l) => (
              <a key={l} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
