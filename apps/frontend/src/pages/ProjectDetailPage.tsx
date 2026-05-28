import { useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProject } from "../hooks/useProjects";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../hooks/useTasks";
import { Task, TaskStatus } from "../types";
import { StatusBadge, PriorityBadge } from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "Por hacer" },
  { id: "in_progress", label: "En progreso" },
  { id: "in_review", label: "En revisión" },
  { id: "done", label: "Completada" },
];

const schema = z.object({
  title: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  due_date: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id!);
  const [filters, setFilters] = useState({ search: "", priority: "" });
  const { data: tasks = [] } = useTasks(id!, filters);
  const createTask = useCreateTask(id!);
  const updateTask = useUpdateTask(id!);
  const deleteTask = useDeleteTask(id!);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const tasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTask.mutate({ id: taskId, status: newStatus });
    }
  };

  const onSubmit = async (data: FormData) => {
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
                              <button
                                onClick={() => setSelectedTask(task)}
                                className="text-xs text-blue-500 hover:text-blue-700"
                              >
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
            <Button variant="secondary" onClick={() => setSelectedTask(null)} className="mt-2">
              Cerrar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
