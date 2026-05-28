import db from "../../db";

export const findByTask = (taskId: string) =>
  db("task_comments")
    .select("task_comments.*", "users.name as author_name")
    .join("users", "task_comments.author_id", "users.id")
    .where("task_comments.task_id", taskId)
    .orderBy("task_comments.created_at", "asc");

export const create = (taskId: string, userId: string, content: string) =>
  db("task_comments")
    .insert({ task_id: taskId, author_id: userId, content })
    .returning("*")
    .then((r) => r[0]);

export const remove = (id: string) => db("task_comments").where({ id }).delete();
