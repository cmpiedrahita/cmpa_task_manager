import * as repo from "./projects.repository";

export const getAll = (userId: string, role: string) => repo.findAll(userId, role);

export const getById = async (id: string) => {
  const project = await repo.findById(id);
  if (!project) throw new Error("NOT_FOUND");
  return project;
};

export const create = (data: { name: string; description?: string }, ownerId: string) =>
  repo.create({ ...data, owner_id: ownerId });

export const update = async (id: string, data: Partial<{ name: string; description: string; status: string }>, userId: string, role: string) => {
  const project = await repo.findById(id);
  if (!project) throw new Error("NOT_FOUND");
  if (project.owner_id !== userId && role !== "admin") throw new Error("FORBIDDEN");
  return repo.update(id, data);
};

export const remove = async (id: string, userId: string, role: string) => {
  const project = await repo.findById(id);
  if (!project) throw new Error("NOT_FOUND");
  if (project.owner_id !== userId && role !== "admin") throw new Error("FORBIDDEN");
  return repo.remove(id);
};
