import db from "../../db";

export const findAll = (userId: string, role: string) => {
  if (role === "admin") {
    return db("projects")
      .select("projects.*", "users.name as owner_name")
      .join("users", "projects.owner_id", "users.id")
      .orderBy("projects.created_at", "desc");
  }

  return db("projects")
    .select("projects.*", "users.name as owner_name")
    .join("users", "projects.owner_id", "users.id")
    .where(function () {
      this.where("projects.owner_id", userId).orWhereIn(
        "projects.id",
        db("project_members").select("project_id").where({ user_id: userId, status: "accepted" })
      );
    })
    .orderBy("projects.created_at", "desc");
};

export const findById = (id: string) =>
  db("projects")
    .select("projects.*", "users.name as owner_name")
    .join("users", "projects.owner_id", "users.id")
    .where("projects.id", id)
    .first();

export const create = (data: { name: string; description?: string; owner_id: string; type?: string }) =>
  db("projects").insert(data).returning("*").then((r) => r[0]);

export const update = (id: string, data: Partial<{ name: string; description: string; status: string }>) =>
  db("projects").where({ id }).update(data).returning("*").then((r) => r[0]);

export const remove = (id: string) => db("projects").where({ id }).delete();
