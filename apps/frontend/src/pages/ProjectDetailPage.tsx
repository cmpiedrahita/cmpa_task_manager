import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProject } from "../hooks/useProjects";
import { useTasks, useCreateTask, useDeleteTask } from "../hooks/useTasks";
import { useComments, useCreateComment, useDeleteComment } from "../hooks/useComments";
import { useAuthStore } from "../store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { Task, TaskStatus } from "../types";
import { StatusBadge, PriorityBadge } from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import { TaskCardSkeleton } from "../components/ui/Skeleton";
import toast from "react-hot-toast";
import api from "../lib/axios";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "Por hacer", color: "text-gray-400 border-gray-500/30" },
  { id: "in_progress", label: "En progreso", color: "text-blue-400 border-blue-500/30" },
  { id: "in_review", label: "En revisión", color: "text-amber-400 border-amber-500/30" },
  { id: "done", label: "Completada", color: "text-emerald-400 border-emerald-500/30" },
];

const taskSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").min(2, "El título debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  due_date: z.string().optional().refine((val) => {
    if (!val) return true;
    return new Date(val) >= new Date(new Date().toISOString().split("T")[0]);
  }, "La fecha límite no puede ser anterior a hoy"),
});

type TaskFormData = z.infer<typeof taskSchema>;

const inputClass = "px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all text-sm w-full [&_option]:bg-gray-900 [&_option]:text-white";
const labelClass = "text-sm font-medium text-gray-300";

function TaskComments({ taskId }: { taskId: string }) {
  const { data: comments = [] } = useComments(taskId);
  const createComment = useCreateComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await createComment.mutateAsync(text.trim());
    setText("");
  };

  return (
    <div className="flex flex-col gap-3 mt-2">
      <h4 className="text-sm font-semibold text-gray-300">
        Comentarios ({comments.length})
      </h4>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-xs text-gray-500">Sin comentarios aún.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-300">{c.author_name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
                {(c.author_id === user?.id || user?.role === "admin") && (
                  <button onClick={() => deleteComment.mutate(c.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Eliminar
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-1">{c.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-violet-500 transition-all text-sm"
        />
        <button
          type="submit"
          disabled={createComment.isPending}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50 shrink-0"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id!);
  const [filters, setFilters] = useState({ search: "", priority: "" });
  const { data: serverTasks = [], isLoading: tasksLoading } = useTasks(id!, filters);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const createTask = useCreateTask(id!);
  const deleteTask = useDeleteTask(id!);
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const editForm = useForm<TaskFormData>({ resolver: zodResolver(taskSchema) });

  const openEdit = (task: Task) => {
    editForm.reset({
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date?.split("T")[0] ?? "",
    });
    setEditingTask(task);
  };

  const onEditSubmit = async (data: TaskFormData) => {
    if (!editingTask) return;
    try {
      await api.patch(`/tasks/${editingTask.id}`, data);
      setLocalTasks((prev) => prev.map((t) => t.id === editingTask.id ? { ...t, ...data } : t));
      setEditingTask(null);
      toast.success("Tarea actualizada");
    } catch {
      toast.error("No se pudo actualizar la tarea. Intenta de nuevo.");
    }
  };

  useEffect(() => {
    setLocalTasks(serverTasks);
  }, [serverTasks]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const tasksByStatus = (status: TaskStatus) => localTasks.filter((t) => t.status === status);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;
    const task = localTasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setLocalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    api.patch(`/tasks/${taskId}`, { status: newStatus })
      .then(() => {
        toast.success("Tarea actualizada");
        qc.invalidateQueries({ queryKey: ["tasks", "all"] });
      })
      .catch(() => {
        setLocalTasks(serverTasks);
        toast.error("Error al actualizar tarea");
      });
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      await createTask.mutateAsync(data);
      reset();
      setModalOpen(false);
    } catch {
      toast.error("No se pudo crear la tarea. Intenta de nuevo.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project?.name}</h1>
          {project?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
          )}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 shrink-0"
        >
          + Nueva tarea
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          placeholder="Buscar tareas..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-violet-500 transition-all text-sm max-w-xs"
        />
        <select
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-violet-500 transition-all text-sm [&_option]:bg-gray-900 [&_option]:text-white"
        >
          <option value="">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="critical">Crítica</option>
        </select>
      </div>

      {/* Kanban */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-3 flex flex-col gap-2 min-h-[200px]">
              <div className={`flex items-center justify-between mb-1 pb-2 border-b ${col.color}`}>
                <span className={`text-sm font-semibold ${col.color.split(" ")[0]}`}>{col.label}</span>
                <span className="text-xs bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded-full px-2 py-0.5">
                  {tasksByStatus(col.id).length}
                </span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-2 flex-1 rounded-xl transition-colors ${snapshot.isDraggingOver ? "bg-violet-500/10" : ""}`}
                  >
                    {tasksLoading
                      ? Array.from({ length: 2 }).map((_, i) => <TaskCardSkeleton key={i} />)
                      : tasksByStatus(col.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => {
                          const isOverdue = task.due_date && task.status !== "done" && new Date(task.due_date) < new Date();
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white dark:bg-white/5 rounded-xl p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing border transition-all ${
                                snapshot.isDragging ? "shadow-xl rotate-1 border-violet-500/50" :
                                isOverdue ? "border-red-400/60 dark:border-red-500/60" :
                                "border-gray-200 dark:border-white/10 hover:border-violet-500/30"}`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                                {isOverdue && <span title="Tarea vencida" className="text-xs shrink-0">⚠️</span>}
                              </div>
                              <div className="flex items-center gap-1 flex-wrap">
                                <PriorityBadge priority={task.priority} />
                              </div>
                              {task.assignee_name && (
                                <p className="text-xs text-gray-400">{task.assignee_name}</p>
                              )}
                              {task.due_date && (
                                <p className={`text-xs ${isOverdue ? "text-red-400 font-medium" : "text-gray-400"}`}>
                                  Vence: {new Date(task.due_date).toLocaleDateString()}
                                </p>
                              )}
                              <div className="flex gap-1 mt-1">
                                <button onClick={() => setSelectedTask(task)} className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-violet-500/50 hover:text-violet-500 dark:hover:text-violet-400 transition-all">
                                  Ver
                                </button>
                                <button onClick={() => openEdit(task)} className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                                  Editar
                                </button>
                                <button onClick={() => setDeletingTaskId(task.id)} className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-red-500/50 hover:text-red-400 transition-all">
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal nueva tarea */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Nueva tarea">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Título</label>
            <input {...register("title")} placeholder="Título de la tarea" className={inputClass} />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Descripción</label>
            <textarea {...register("description")} rows={3} placeholder="Descripción opcional..." className={`${inputClass} resize-none`} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Prioridad</label>
            <select {...register("priority")} className={inputClass}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Fecha límite</label>
            <input type="date" min={new Date().toISOString().split("T")[0]} {...register("due_date")} className={inputClass} />
            {errors.due_date && <p className="text-xs text-red-400">{errors.due_date.message}</p>}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => { setModalOpen(false); reset(); }} className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50">
              {isSubmitting ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal editar tarea */}
      <Modal open={!!editingTask} onClose={() => setEditingTask(null)} title="Editar tarea">
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Título</label>
            <input {...editForm.register("title")} className={inputClass} />
            {editForm.formState.errors.title && <p className="text-xs text-red-400">{editForm.formState.errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="edit-description" className={labelClass}>Descripción</label>
            <textarea id="edit-description" {...editForm.register("description")} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="edit-priority" className={labelClass}>Prioridad</label>
            <select id="edit-priority" {...editForm.register("priority")} className={inputClass}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Fecha límite</label>
            <input type="date" min={new Date().toISOString().split("T")[0]} {...editForm.register("due_date")} className={inputClass} />
            {editForm.formState.errors.due_date && <p className="text-xs text-red-400">{editForm.formState.errors.due_date.message}</p>}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setEditingTask(null)} className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={editForm.formState.isSubmitting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50">
              {editForm.formState.isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal detalle */}
      <Modal open={!!selectedTask} onClose={() => setSelectedTask(null)} title="Detalle de tarea">
        {selectedTask && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-white">{selectedTask.title}</h3>
            {selectedTask.description && (
              <p className="text-sm text-gray-400">{selectedTask.description}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={selectedTask.status} />
              <PriorityBadge priority={selectedTask.priority} />
            </div>
            {selectedTask.assignee_name && (
              <p className="text-sm text-gray-400">Asignado a: {selectedTask.assignee_name}</p>
            )}
            {selectedTask.due_date && (
              <p className="text-sm text-gray-400">
                Vence: {new Date(selectedTask.due_date).toLocaleDateString()}
              </p>
            )}
            <hr className="border-white/10" />
            <TaskComments taskId={selectedTask.id} />
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={() => { deleteTask.mutate(deletingTaskId!); setDeletingTaskId(null); }}
        message="¿Eliminar esta tarea? Esta acción no se puede deshacer."
      />
    </div>
  );
}
