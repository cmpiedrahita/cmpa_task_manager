import db from "../../db";

interface TaskFilters {
  status?: string;
  priority?: string;
  assignee_id?: string;
  search?: string;
}

export const findAllByUser = (userId: string, role: string) => {
  const query = db("tasks")
    .select("tasks.*", "users.name as assignee_name")
    .leftJoin("users", "tasks.assignee_id", "users.id")
    .join("projects", "tasks.project_id", "projects.id");
  if (role !== "admin") query.where("projects.owner_id", userId);
  return query.orderBy("tasks.created_at", "desc");
};

export const findByProject = (projectId: string, filters: TaskFilters = {}) => {
  const query = db("tasks")
    .select("tasks.*", "users.name as assignee_name")
    .leftJoin("users", "tasks.assignee_id", "users.id")
    .where("tasks.project_id", projectId)
    .orderBy("tasks.position");

  if (filters.status) query.where("tasks.status", filters.status);
  if (filters.priority) query.where("tasks.priority", filters.priority);
  if (filters.assignee_id) query.where("tasks.assignee_id", filters.assignee_id);
  if (filters.search) query.whereILike("tasks.title", `%${filters.search}%`);

  return query;
};

export const findById = (id: string) =>
  db("tasks").select("tasks.*", "users.name as assignee_name").leftJoin("users", "tasks.assignee_id", "users.id").where("tasks.id", id).first();

export const create = (data: Record<string, unknown>) =>
  db("tasks").insert(data).returning("*").then((r) => r[0]);

export const update = (id: string, data: Record<string, unknown>) =>
  db("tasks").where({ id }).update(data).returning("*").then((r) => r[0]);

export const remove = (id: string) => db("tasks").where({ id }).delete();
