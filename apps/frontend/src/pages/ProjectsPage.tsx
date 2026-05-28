import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProjects, useCreateProject, useDeleteProject } from "../hooks/useProjects";
import { useAuthStore } from "../store/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { Project } from "../types";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const user = useAuthStore((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await createProject.mutateAsync(data);
    reset();
    setModalOpen(false);
  };

  const canModify = (project: Project) =>
    user?.role === "admin" || project.owner_id === user?.id;

  if (isLoading) return <div className="text-center py-20 text-gray-500">Cargando proyectos...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proyectos</h1>
        <Button onClick={() => setModalOpen(true)}>Nuevo proyecto</Button>
      </div>

      {projects?.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No hay proyectos aún. Crea el primero.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <h2
                className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {project.name}
              </h2>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                project.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}>
                {project.status === "active" ? "Activo" : "Archivado"}
              </span>
            </div>

            {project.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {project.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400">{project.owner_name}</span>
              <div className="flex gap-2">
                <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => navigate(`/projects/${project.id}`)}>
                  Ver
                </Button>
                {canModify(project) && (
                  <Button
                    variant="danger"
                    className="text-xs px-2 py-1"
                    onClick={() => {
                      if (confirm("¿Eliminar este proyecto?")) deleteProject.mutate(project.id);
                    }}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Nuevo proyecto">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nombre" {...register("name")} error={errors.name?.message} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <textarea
              {...register("description")}
              rows={3}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" type="button" onClick={() => { setModalOpen(false); reset(); }}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Crear
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
