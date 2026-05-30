import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "../hooks/useProjects";
import { useAuthStore } from "../store/authStore";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import { Project } from "../types";
import { ProjectCardSkeleton } from "../components/ui/Skeleton";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
});

type FormData = z.infer<typeof schema>;

const inputClass = "px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all text-sm w-full [&_option]:bg-gray-900 [&_option]:text-white";
const labelClass = "text-sm font-medium text-gray-300";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const user = useAuthStore((s) => s.user);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const createForm = useForm<FormData>({ resolver: zodResolver(schema) });
  const editForm = useForm<FormData>({ resolver: zodResolver(schema) });

  const onCreateSubmit = async (data: FormData) => {
    await createProject.mutateAsync(data);
    createForm.reset();
    setCreateOpen(false);
  };

  const onEditSubmit = async (data: FormData) => {
    if (!editingProject) return;
    await updateProject.mutateAsync({ id: editingProject.id, ...data });
    setEditingProject(null);
  };

  const openEdit = (project: Project) => {
    editForm.reset({ name: project.name, description: project.description, status: project.status });
    setEditingProject(project);
  };

  const canModify = (project: Project) =>
    user?.role === "admin" || project.owner_id === user?.id;

  if (isLoading) return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proyectos</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proyectos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {projects?.length ?? 0} proyecto{projects?.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
        >
          + Nuevo proyecto
        </button>
      </div>

      {/* Empty state */}
      {projects?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">No hay proyectos aún</p>
          <p className="text-sm text-gray-600">Crea tu primer proyecto para empezar</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all"
          >
            Crear proyecto
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <div
            key={project.id}
            className="group bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-5 flex flex-col gap-3 hover:border-violet-500/40 dark:hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-2">
              <h2
                className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {project.name}
              </h2>
              <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 font-medium ${
                project.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
              }`}>
                {project.status === "active" ? "Activo" : "Archivado"}
              </span>
            </div>

            {project.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
            )}

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-white/10">
              <span className="text-xs text-gray-400">{project.owner_name}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-violet-500/50 hover:text-violet-500 dark:hover:text-violet-400 transition-all"
                >
                  Ver
                </button>
                {canModify(project) && (
                  <>
                    <button
                      onClick={() => openEdit(project)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeletingProjectId(project.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-red-900/50 text-gray-500 dark:text-gray-400 hover:border-red-500/50 hover:text-red-500 dark:hover:text-red-400 transition-all"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal crear */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); createForm.reset(); }} title="Nuevo proyecto">
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Nombre</label>
            <input {...createForm.register("name")} placeholder="Nombre del proyecto" className={inputClass} />
            {createForm.formState.errors.name && <p className="text-xs text-red-400">{createForm.formState.errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="create-description" className={labelClass}>Descripción</label>
            <textarea
              id="create-description"
              {...createForm.register("description")}
              rows={3}
              placeholder="Descripción opcional..."
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => { setCreateOpen(false); createForm.reset(); }} className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={createForm.formState.isSubmitting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50">
              {createForm.formState.isSubmitting ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal editar */}
      <Modal open={!!editingProject} onClose={() => setEditingProject(null)} title="Editar proyecto">
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Nombre</label>
            <input {...editForm.register("name")} className={inputClass} />
            {editForm.formState.errors.name && <p className="text-xs text-red-400">{editForm.formState.errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="edit-description" className={labelClass}>Descripción</label>
            <textarea id="edit-description" {...editForm.register("description")} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="edit-status" className={labelClass}>Estado</label>
            <select id="edit-status" {...editForm.register("status")} className={inputClass}>
              <option value="active">Activo</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setEditingProject(null)} className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={editForm.formState.isSubmitting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50">
              {editForm.formState.isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deletingProjectId}
        onClose={() => setDeletingProjectId(null)}
        onConfirm={() => { deleteProject.mutate(deletingProjectId!); setDeletingProjectId(null); }}
        message="¿Eliminar este proyecto? Se eliminarán todas sus tareas y comentarios."
      />
    </div>
  );
}
