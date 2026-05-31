import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import toast from "react-hot-toast";

export interface Member {
  id: string;
  project_id: string;
  user_id: string;
  status: "pending" | "accepted" | "rejected";
  name: string;
  email: string;
}

export interface Invitation {
  id: string;
  project_id: string;
  project_name: string;
  owner_name: string;
  status: "pending" | "accepted" | "rejected";
}

export interface UserResult {
  id: string;
  name: string;
  email: string;
}

export const useMembers = (projectId: string) =>
  useQuery<Member[]>({
    queryKey: ["members", projectId],
    queryFn: () => api.get(`/projects/${projectId}/members`).then((r) => r.data),
    enabled: !!projectId,
  });

export const useInvitations = () =>
  useQuery<Invitation[]>({
    queryKey: ["invitations"],
    queryFn: () => api.get("/invitations").then((r) => r.data),
    refetchInterval: 30000,
  });

export const useInviteMember = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.post(`/projects/${projectId}/members`, { userId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", projectId] });
      toast.success("Invitación enviada");
    },
    onError: (e: { response?: { data?: { error?: string } } }) => {
      toast.error(e.response?.data?.error ?? "Error al invitar usuario");
    },
  });
};

export const useRespondInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "accepted" | "rejected" }) =>
      api.patch(`/invitations/${id}`, { status }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invitations"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useSearchUsers = (query: string) =>
  useQuery<UserResult[]>({
    queryKey: ["users", "search", query],
    queryFn: () => api.get(`/users/search?q=${query}`).then((r) => r.data),
    enabled: query.length >= 2,
  });
