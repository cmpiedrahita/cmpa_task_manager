import { useProjects } from "../hooks/useProjects";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Task } from "../types";
import api from "../lib/axios";
import jsPDF from "jspdf";
import { DashboardStatSkeleton } from "../components/ui/Skeleton";

const STATUS_COLORS: Record<string, string> = {
  "Por hacer": "#6b7280",
  "En progreso": "#3b82f6",
  "En revisión": "#f59e0b",
  "Completada": "#22c55e",
};

const PRIORITY_COLORS: Record<string, string> = {
  "Baja": "#6b7280",
  "Media": "#818cf8",
  "Alta": "#f97316",
  "Crítica": "#ef4444",
};

const BRAND_COLORS = ["#7c3aed", "#6d28d9", "#4f46e5", "#3b82f6"];

const useAllTasks = () =>
  useQuery<Task[]>({
    queryKey: ["tasks", "all"],
    queryFn: () => api.get("/tasks/all").then((r) => r.data),
  });

export default function DashboardPage() {
  const { data: projects = [] } = useProjects();
  const { data: allTasks = [], isLoading } = useAllTasks();

  if (isLoading) return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cargando resumen...</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <DashboardStatSkeleton key={i} />)}
      </div>
    </div>
  );

  const statusData = [
    { name: "Por hacer", value: allTasks.filter((t) => t.status === "todo").length },
    { name: "En progreso", value: allTasks.filter((t) => t.status === "in_progress").length },
    { name: "En revisión", value: allTasks.filter((t) => t.status === "in_review").length },
    { name: "Completada", value: allTasks.filter((t) => t.status === "done").length },
  ];

  const priorityData = [
    { name: "Baja", value: allTasks.filter((t) => t.priority === "low").length },
    { name: "Media", value: allTasks.filter((t) => t.priority === "medium").length },
    { name: "Alta", value: allTasks.filter((t) => t.priority === "high").length },
    { name: "Crítica", value: allTasks.filter((t) => t.priority === "critical").length },
  ];

  const projectData = projects.map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
    tareas: allTasks.filter((t) => t.project_id === p.id).length,
  }));

  const completionRate = allTasks.length
    ? Math.round((allTasks.filter((t) => t.status === "done").length / allTasks.length) * 100)
    : 0;

  const exportPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString("es-CO");
    doc.setFontSize(18);
    doc.text("Reporte de Gestión de Tareas", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generado el ${date}`, 14, 28);
    doc.setTextColor(0);
    doc.setFontSize(13);
    doc.text("Resumen general", 14, 42);
    doc.setFontSize(11);
    const stats = [
      ["Proyectos activos", String(projects.length)],
      ["Tareas totales", String(allTasks.length)],
      ["Tareas completadas", String(allTasks.filter((t) => t.status === "done").length)],
      ["Tasa de completado", `${completionRate}%`],
    ];
    stats.forEach(([label, value], i) => doc.text(`${label}: ${value}`, 14, 52 + i * 8));
    doc.setFontSize(13);
    doc.text("Tareas por estado", 14, 96);
    doc.setFontSize(11);
    statusData.forEach((s, i) => doc.text(`${s.name}: ${s.value}`, 14, 106 + i * 8));
    doc.setFontSize(13);
    doc.text("Tareas por prioridad", 14, 146);
    doc.setFontSize(11);
    priorityData.forEach((p, i) => doc.text(`${p.name}: ${p.value}`, 14, 156 + i * 8));
    doc.setFontSize(13);
    doc.text("Tareas por proyecto", 14, 196);
    doc.setFontSize(11);
    projectData.forEach((p, i) => doc.text(`${p.name}: ${p.tareas} tarea(s)`, 14, 206 + i * 8));
    doc.save(`reporte-tareas-${date}.pdf`);
  };

  const stats = [
    { label: "Proyectos", value: projects.length, sub: "activos" },
    { label: "Tareas totales", value: allTasks.length, sub: "registradas" },
    { label: "Completadas", value: allTasks.filter((t) => t.status === "done").length, sub: "finalizadas" },
    { label: "Completado", value: `${completionRate}%`, sub: "tasa general" },
  ];

  return (
    <div className="flex flex-col gap-8 relative">

      {/* Radial bg glows */}
      <div className="pointer-events-none fixed top-0 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Resumen general de tus proyectos y tareas
          </p>
        </div>
        <button
          onClick={exportPDF}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 shrink-0"
        >
          Exportar PDF
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-5 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-blue-500/0 group-hover:from-violet-500/5 group-hover:to-blue-500/5 transition-all duration-300 rounded-2xl" />
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-6 hover:border-violet-500/20 transition-all">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tareas por estado</h2>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 mb-4">Distribución actual del flujo de trabajo</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-6 hover:border-violet-500/20 transition-all">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tareas por prioridad</h2>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 mb-4">Nivel de urgencia de las tareas pendientes</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
              <Bar dataKey="value" name="Tareas" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-6 lg:col-span-2 hover:border-violet-500/20 transition-all">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tareas por proyecto</h2>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 mb-4">Carga de trabajo distribuida entre proyectos activos</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projectData}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
              <Bar dataKey="tareas" radius={[6, 6, 0, 0]}>
                {projectData.map((_, i) => (
                  <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
