import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import AnimatedBackground from "../components/ui/AnimatedBackground";
import Button from "../components/ui/Button";

export default function LandingPage() {
  const token = useAuthStore((s) => s.accessToken);
  const navigate = useNavigate();

  if (token) return <Navigate to="/projects" replace />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div className="absolute inset-0 -z-10 bg-gray-950/60 backdrop-blur-sm" />
      <AnimatedBackground />

      <div className="max-w-2xl flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-sm">
          Gestion de proyectos y tareas
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
          CMPA
          <span className="block text-blue-400">Task Manager</span>
        </h1>

        <p className="text-lg text-gray-300 max-w-md">
          Organiza tus proyectos, gestiona tareas con tablero Kanban y visualiza el progreso de tu equipo en tiempo real.
        </p>

        <div className="flex gap-3 mt-2">
          <Button onClick={() => navigate("/login")} className="px-8 py-3 text-base">
            Iniciar sesion
          </Button>
          <Button variant="secondary" onClick={() => navigate("/register")} className="px-8 py-3 text-base">
            Crear cuenta
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8 w-full max-w-lg">
          {[
            { label: "Tablero visual", desc: "Mueve tareas entre columnas con solo arrastrarlas" },
            { label: "Dashboard", desc: "Ve el avance de tus proyectos con graficos claros" },
            { label: "Acceso seguro", desc: "Tu informacion protegida con autenticacion moderna" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg cursor-default"
            >
              <p className="font-semibold text-white text-sm">{f.label}</p>
              <p className="text-xs text-gray-300 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
