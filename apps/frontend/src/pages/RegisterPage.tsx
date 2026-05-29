import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AnimatedBackground from "../components/ui/AnimatedBackground";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="w-full max-w-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Crear cuenta</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nombre" {...register("name")} error={errors.name?.message} />
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Contraseña" type="password" {...register("password")} error={errors.password?.message} />
          <Button type="submit" loading={isSubmitting} className="mt-2">
            Registrarse
          </Button>
        </form>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
