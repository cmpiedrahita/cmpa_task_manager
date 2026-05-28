import { TaskPriority, TaskStatus } from "../../types";

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  in_review: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  medium: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  high: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  critical: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "Por hacer",
  in_progress: "En progreso",
  in_review: "En revisión",
  done: "Completada",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityStyles[priority]}`}>
      {priorityLabels[priority]}
    </span>
  );
}
