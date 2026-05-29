import { useProjects } from "../hooks/useProjects";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Task } from "../types";
import api from "../lib/axios";
import Button from "../components/ui/Button";
import jsPDF from "jspdf";

const STATUS_COLORS: Record<string, string> = {
  "Por hacer": "#6b7280",
  "En progreso": "#3b82f6",
  "En revisión": "#f59e0b",
  "Completada": "#22c55e",
};

const PRIORITY_COLORS: Record<string, string> = {
  "Baja": "#6b7280",
  "Media": "#3b82f6",
  "Alta": "#f97316",
  "Crítica": "#ef4444",
};

const useAllTasks = () =>
  useQuery<Task[]>({
    queryKey: ["tasks", "all"],
    queryFn: () => api.get("/tasks/all").then((r) => r.data),
  });

export default function DashboardPage() {
  const { data: projects = [] } = useProjects();
  const { data: allTasks = [], isLoading } = useAllTasks();

  if (isLoading) return <div className="text-center py-20 text-gray-500">Cargando dashboard...</div>;

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
    stats.forEach(([label, value], i) => {
      doc.text(`${label}: ${value}`, 14, 52 + i * 8);
    });

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Button onClick={exportPDF}>Exportar PDF</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Proyectos", value: projects.length },
          { label: "Tareas totales", value: allTasks.length },
          { label: "Completadas", value: allTasks.filter((t) => t.status === "done").length },
          { label: "Tasa de completado", value: `${completionRate}%` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Tareas por estado</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Tareas por prioridad</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Tareas" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Tareas por proyecto</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projectData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="tareas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
