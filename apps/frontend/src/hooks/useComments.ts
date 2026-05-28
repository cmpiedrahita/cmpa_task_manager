import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/axios";

export interface Comment {
  id: string;
  content: string;
  task_id: string;
  author_id: string;
  author_name: string;
  created_at: string;
}

export const useComments = (taskId: string) =>
  useQuery<Comment[]>({
    queryKey: ["comments", taskId],
    queryFn: () => api.get(`/tasks/${taskId}/comments`).then((r) => r.data),
    enabled: !!taskId,
  });

export const useCreateComment = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.post(`/tasks/${taskId}/comments`, { content }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", taskId] }),
    onError: () => toast.error("Error al agregar comentario"),
  });
};

export const useDeleteComment = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/comments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", taskId] }),
    onError: () => toast.error("Error al eliminar comentario"),
  });
};
