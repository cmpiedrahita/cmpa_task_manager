import * as repo from "./comments.repository";
import db from "../../db";

export const getByTask = (taskId: string) => repo.findByTask(taskId);

export const create = (taskId: string, userId: string, content: string) =>
  repo.create(taskId, userId, content);

export const remove = async (id: string, userId: string, role: string) => {
  const comment = await db("task_comments").where({ id }).first();
  if (!comment) throw new Error("NOT_FOUND");
  if (comment.author_id !== userId && role !== "admin") throw new Error("FORBIDDEN");
  return repo.remove(id);
};
