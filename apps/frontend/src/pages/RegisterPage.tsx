import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
    .regex(/[0-9]/, "Debe tener al menos un número"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/auth/register", data);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate("/projects");
    } catch (e: unknown) {
      const status = (e as { response?: { status: number } }).response?.status;
      toast.error(status === 409 ? "El email ya está registrado" : "Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-row-reverse">

      {/* Right panel — image */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <img
          src="/dashboard2.png"
          alt="Dashboard"
          className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-900/60 via-[#050816]/40 to-violet-900/60" />

        <div className="relative z-10 flex flex-col justify-end p-12 w-full">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Empieza hoy.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Sin límites.
            </span>
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-sm">
            Crea tu cuenta gratis y comienza a gestionar proyectos con tu equipo en minutos.
          </p>

          <div className="flex gap-4">
            {[
              { value: "10K+", label: "Usuarios activos" },
              { value: "99.9%", label: "Disponibilidad" },
              { value: "4.9★", label: "Valoración" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
              >
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl" />
      </div>

      {/* Left panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm relative">
          <div className="bg-white/5 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-8 shadow-2xl shadow-violet-500/10">
            <div className="mb-8">
              <span className="font-bold text-lg text-white">CMPA</span>
              <h1 className="text-3xl font-bold text-white mt-4 mb-1">Crear cuenta</h1>
              <p className="text-sm text-gray-500">Únete y empieza a gestionar tus proyectos</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300">Nombre</label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Tu nombre"
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all text-sm"
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="tu@email.com"
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all text-sm"
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300">Contraseña</label>
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all text-sm"
                />
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Crear cuenta
              </button>
            </form>

            <p className="text-sm text-center text-gray-500 mt-6">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
