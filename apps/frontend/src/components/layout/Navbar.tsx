import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import { useInvitations, useRespondInvitation } from "../../hooks/useMembers";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [invitationsOpen, setInvitationsOpen] = useState(false);

  const { data: invitations = [] } = useInvitations();
  const respondInvitation = useRespondInvitation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    setMenuOpen(false);
    setInvitationsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRespond = async (id: string, status: "accepted" | "rejected") => {
    await respondInvitation.mutateAsync({ id, status });
    toast.success(status === "accepted" ? "Te uniste al proyecto" : "Invitación rechazada");
  };

  const navLink = (to: string, label: string) => {
    const active = location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
          active
            ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-bold text-gray-900 dark:text-white mr-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            CMPA
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            {navLink("/projects", "Proyectos")}
            {navLink("/dashboard", "Dashboard")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark((d) => !d)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-base"
            title={dark ? "Modo claro" : "Modo oscuro"}
          >
            {dark ? "☀" : "☾"}
          </button>

          {/* Invitations bell */}
          <div className="relative">
            <button
              onClick={() => setInvitationsOpen((o) => !o)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
              title="Invitaciones"
            >
              🔔
              {invitations.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {invitations.length}
                </span>
              )}
            </button>

            {invitationsOpen && (
              <div className="absolute right-0 top-10 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Invitaciones pendientes</p>
                </div>
                {invitations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Sin invitaciones pendientes</p>
                ) : (
                  <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="px-4 py-3 flex flex-col gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{inv.project_name}</p>
                          <p className="text-xs text-gray-500">Invitado por {inv.owner_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespond(inv.id, "accepted")}
                            className="flex-1 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleRespond(inv.id, "rejected")}
                            className="flex-1 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs transition-colors"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
              {user?.name}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="hidden sm:block text-sm px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            Salir
          </button>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Menú"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{user?.name}</span>
          </div>
          {navLink("/projects", "Proyectos")}
          {navLink("/dashboard", "Dashboard")}
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left"
          >
            Salir
          </button>
        </div>
      )}
    </nav>
  );
}
