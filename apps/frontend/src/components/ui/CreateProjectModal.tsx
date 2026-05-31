import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "./Modal";
import { useCreateProject } from "../../hooks/useProjects";
import { useInviteMember, useSearchUsers, UserResult } from "../../hooks/useMembers";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const inputClass = "px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all text-sm w-full";
const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ open, onClose }: Props) {
  const [step, setStep] = useState<"type" | "form" | "members">("type");
  const [projectType, setProjectType] = useState<"personal" | "team">("personal");
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<UserResult[]>([]);

  const createProject = useCreateProject();
  const { data: searchResults = [] } = useSearchUsers(searchQuery);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    setStep("type");
    setProjectType("personal");
    setCreatedProjectId(null);
    setSearchQuery("");
    setInvitedUsers([]);
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    const project = await createProject.mutateAsync({ ...data, type: projectType });
    if (projectType === "personal") {
      handleClose();
    } else {
      setCreatedProjectId(project.id);
      setStep("members");
    }
  };

  const inviteMember = useInviteMember(createdProjectId ?? "");

  const handleInvite = async (user: UserResult) => {
    if (invitedUsers.find((u) => u.id === user.id)) return;
    await inviteMember.mutateAsync(user.id);
    setInvitedUsers((prev) => [...prev, user]);
    setSearchQuery("");
  };

  return (
    <Modal open={open} onClose={handleClose} title={
      step === "type" ? "Nuevo proyecto" :
      step === "form" ? `Proyecto ${projectType === "personal" ? "personal" : "de equipo"}` :
      "Invitar miembros"
    }>
      {/* Step 1 — tipo */}
      {step === "type" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-400">¿Qué tipo de proyecto quieres crear?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setProjectType("personal"); setStep("form"); }}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all group"
            >
              <span className="text-3xl">👤</span>
              <div className="text-center">
                <p className="font-semibold text-white text-sm">Personal</p>
                <p className="text-xs text-gray-500 mt-1">Solo para ti</p>
              </div>
            </button>
            <button
              onClick={() => { setProjectType("team"); setStep("form"); }}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all group"
            >
              <span className="text-3xl">👥</span>
              <div className="text-center">
                <p className="font-semibold text-white text-sm">Equipo</p>
                <p className="text-xs text-gray-500 mt-1">Colabora con otros</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — formulario */}
      {step === "form" && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Nombre</label>
            <input {...register("name")} placeholder="Nombre del proyecto" className={inputClass} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Descripción</label>
            <textarea {...register("description")} rows={3} placeholder="Descripción opcional..." className={`${inputClass} resize-none`} />
          </div>
          <div className="flex justify-between gap-2 mt-2">
            <button type="button" onClick={() => setStep("type")} className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
              Atrás
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50">
              {isSubmitting ? "Creando..." : projectType === "personal" ? "Crear" : "Siguiente →"}
            </button>
          </div>
        </form>
      )}

      {/* Step 3 — invitar miembros */}
      {step === "members" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-400">Busca y agrega miembros a tu proyecto.</p>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Buscar usuarios</label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nombre o email..."
              className={inputClass}
            />
          </div>

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {searchResults
                .filter((u) => !invitedUsers.find((i) => i.id === u.id))
                .map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleInvite(user)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-violet-500/10 border border-white/10 hover:border-violet-500/30 transition-all text-left"
                  >
                    <div>
                      <p className="text-sm text-white">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-violet-400">+ Invitar</span>
                  </button>
                ))}
            </div>
          )}

          {invitedUsers.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Invitados</p>
              {invitedUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs text-emerald-400">✓</span>
                  <p className="text-sm text-gray-900 dark:text-white">{u.name}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-2">
            <button onClick={handleClose} className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all">
              Finalizar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
