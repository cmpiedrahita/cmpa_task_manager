import * as repo from "./tasks.repository";
import * as projectsRepo from "../projects/projects.repository";
import db from "../../db";

export const getByProject = (projectId: string, filters: Record<string, string>) =>
  repo.findByProject(projectId, filters);

export const getById = async (id: string) => {
  const task = await repo.findById(id);
  if (!task) throw new Error("NOT_FOUND");
  return task;
};

export const create = async (projectId: string, data: Record<string, unknown>, userId: string, role: string) => {
  const project = await projectsRepo.findById(projectId);
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  if (project.owner_id !== userId && role !== "admin") throw new Error("FORBIDDEN");
  return repo.create({ ...data, project_id: projectId });
};

export const update = async (id: string, data: Record<string, unknown>, userId: string, role: string) => {
  const task = await repo.findById(id);
  if (!task) throw new Error("NOT_FOUND");
  const project = await projectsRepo.findById(task.project_id);
  const isOwner = project?.owner_id === userId || role === "admin";

  if (!isOwner) {
    const membership = await db("project_members")
      .where({ project_id: task.project_id, user_id: userId, status: "accepted" })
      .first();
    if (!membership) throw new Error("FORBIDDEN");
    // members can only update status
    const allowedKeys = ["status"];
    const hasDisallowedKeys = Object.keys(data).some((k) => !allowedKeys.includes(k));
    if (hasDisallowedKeys) throw new Error("FORBIDDEN");
  }

  return repo.update(id, data);
};

export const remove = async (id: string, userId: string, role: string) => {
  const task = await repo.findById(id);
  if (!task) throw new Error("NOT_FOUND");
  const project = await projectsRepo.findById(task.project_id);
  if (project?.owner_id !== userId && role !== "admin") throw new Error("FORBIDDEN");
  return repo.remove(id);
};
