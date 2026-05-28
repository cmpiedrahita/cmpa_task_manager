import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Navbar from "./Navbar";
import AnimatedBackground from "../ui/AnimatedBackground";

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatedBackground />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
