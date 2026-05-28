import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProject } from "../hooks/useProjects";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../hooks/useTasks";
import { useComments, useCreateComment, useDeleteComment } from "../hooks/useComments";
import { useAuthStore } from "../store/authStore";
import { Task, TaskStatus } from "../types";
import { StatusBadge, PriorityBadge } from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import toast from "react-hot-toast";
import api from "../lib/axios";

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "Por hacer" },
  { id: "in_progress", label: "En progreso" },
  { id: "in_review", label: "En revisión" },
  { id: "done", label: "Completada" },
];

const taskSchema = z.object({
  title: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  due_date: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

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
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Comentarios ({comments.length})
      </h4>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-xs text-gray-400">Sin comentarios aún.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.author_name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
                {(c.author_id === user?.id || user?.role === "admin") && (
                  <button onClick={() => deleteComment.mutate(c.id)} className="text-xs text-red-400 hover:text-red-600">
                    Eliminar
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{c.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none focus:border-blue-500"
        />
        <Button type="submit" loading={createComment.isPending} className="shrink-0">
          Enviar
        </Button>
      </form>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id!);
  const [filters, setFilters] = useState({ search: "", priority: "" });
  const { data: serverTasks = [] } = useTasks(id!, filters);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const createTask = useCreateTask(id!);
  const updateTask = useUpdateTask(id!);
  const deleteTask = useDeleteTask(id!);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
      .then(() => toast.success("Tarea actualizada"))
      .catch(() => {
        setLocalTasks(serverTasks);
        toast.error("Error al actualizar tarea");
      });
  };

  const onSubmit = async (data: TaskFormData) => {
    await createTask.mutateAsync(data);
    reset();
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project?.name}</h1>
          {project?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
          )}
        </div>
        <Button onClick={() => setModalOpen(true)}>Nueva tarea</Button>
      </div>

      <div className="flex gap-3 mb-6 mt-4">
        <Input
          placeholder="Buscar tareas..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="max-w-xs"
        />
        <select
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none focus:border-blue-500"
        >
          <option value="">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="critical">Crítica</option>
        </select>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 flex flex-col gap-2 min-h-[200px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{col.label}</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full px-2 py-0.5">
                  {tasksByStatus(col.id).length}
                </span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-2 flex-1 rounded-lg transition-colors ${snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                  >
                    {tasksByStatus(col.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm flex flex-col gap-2 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? "shadow-lg rotate-1" : ""}`}
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                            <div className="flex items-center gap-1 flex-wrap">
                              <PriorityBadge priority={task.priority} />
                            </div>
                            {task.assignee_name && (
                              <p className="text-xs text-gray-400">{task.assignee_name}</p>
                            )}
                            {task.due_date && (
                              <p className="text-xs text-gray-400">
                                Vence: {new Date(task.due_date).toLocaleDateString()}
                              </p>
                            )}
                            <div className="flex gap-1 mt-1">
                              <button onClick={() => setSelectedTask(task)} className="text-xs text-blue-500 hover:text-blue-700">
                                Ver
                              </button>
                              <button
                                onClick={() => { if (confirm("¿Eliminar tarea?")) deleteTask.mutate(task.id); }}
                                className="text-xs text-red-400 hover:text-red-600"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        )}
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

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Nueva tarea">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Título" {...register("title")} error={errors.title?.message} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <textarea
              {...register("description")}
              rows={3}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prioridad</label>
            <select
              {...register("priority")}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none focus:border-blue-500"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
          <Input label="Fecha límite" type="date" {...register("due_date")} />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" type="button" onClick={() => { setModalOpen(false); reset(); }}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>Crear</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!selectedTask} onClose={() => setSelectedTask(null)} title="Detalle de tarea">
        {selectedTask && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">{selectedTask.title}</h3>
            {selectedTask.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.description}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={selectedTask.status} />
              <PriorityBadge priority={selectedTask.priority} />
            </div>
            {selectedTask.assignee_name && (
              <p className="text-sm text-gray-500">Asignado a: {selectedTask.assignee_name}</p>
            )}
            {selectedTask.due_date && (
              <p className="text-sm text-gray-500">
                Vence: {new Date(selectedTask.due_date).toLocaleDateString()}
              </p>
            )}
            <hr className="border-gray-200 dark:border-gray-700" />
            <TaskComments taskId={selectedTask.id} />
          </div>
        )}
      </Modal>
    </div>
  );
}
