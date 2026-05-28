import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { Task } from "../types";

interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
}

export const useTasks = (projectId: string, filters: TaskFilters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
  );
  return useQuery<Task[]>({
    queryKey: ["tasks", projectId, params],
    queryFn: () =>
      api.get(`/projects/${projectId}/tasks`, { params }).then((r) => r.data),
    enabled: !!projectId,
  });
};

export const useCreateTask = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Task>) =>
      api.post(`/projects/${projectId}/tasks`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Tarea creada");
    },
    onError: () => toast.error("Error al crear tarea"),
  });
};

export const useUpdateTask = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Task> & { id: string }) =>
      api.patch(`/tasks/${id}`, data).then((r) => r.data),
    onMutate: async ({ id, ...data }) => {
      await qc.cancelQueries({ queryKey: ["tasks", projectId] });
      const snapshots = qc.getQueriesData<Task[]>({ queryKey: ["tasks", projectId] });
      qc.setQueriesData<Task[]>({ queryKey: ["tasks", projectId] }, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
      return { snapshots };
    },
    onSuccess: () => {
      toast.success("Tarea actualizada");
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error("Error al actualizar tarea");
    },
  });
};

export const useDeleteTask = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Tarea eliminada");
    },
    onError: () => toast.error("Error al eliminar tarea"),
  });
};
