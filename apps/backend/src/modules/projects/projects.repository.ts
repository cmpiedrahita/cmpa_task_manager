import db from "../../db";

export const findAll = (userId: string, role: string) => {
  const query = db("projects").select("projects.*", "users.name as owner_name").join("users", "projects.owner_id", "users.id");
  if (role !== "admin") query.where("projects.owner_id", userId);
  return query.orderBy("projects.created_at", "desc");
};

export const findById = (id: string) =>
  db("projects").select("projects.*", "users.name as owner_name").join("users", "projects.owner_id", "users.id").where("projects.id", id).first();

export const create = (data: { name: string; description?: string; owner_id: string }) =>
  db("projects").insert(data).returning("*").then((r) => r[0]);

export const update = (id: string, data: Partial<{ name: string; description: string; status: string }>) =>
  db("projects").where({ id }).update(data).returning("*").then((r) => r[0]);

export const remove = (id: string) => db("projects").where({ id }).delete();
