import db from "../../db";

export const findMembers = (projectId: string) =>
  db("project_members")
    .select("project_members.*", "users.name", "users.email")
    .join("users", "project_members.user_id", "users.id")
    .where("project_members.project_id", projectId)
    .where("project_members.status", "accepted");

export const findPendingInvitations = (userId: string) =>
  db("project_members")
    .select("project_members.*", "projects.name as project_name", "users.name as owner_name")
    .join("projects", "project_members.project_id", "projects.id")
    .join("users", "projects.owner_id", "users.id")
    .where("project_members.user_id", userId)
    .where("project_members.status", "pending");

export const findMembership = (projectId: string, userId: string) =>
  db("project_members").where({ project_id: projectId, user_id: userId }).first();

export const invite = (projectId: string, userId: string) =>
  db("project_members").insert({ project_id: projectId, user_id: userId }).returning("*").then((r) => r[0]);

export const updateStatus = (id: string, status: "accepted" | "rejected") =>
  db("project_members").where({ id }).update({ status }).returning("*").then((r) => r[0]);

export const remove = (projectId: string, userId: string) =>
  db("project_members").where({ project_id: projectId, user_id: userId }).delete();

export const searchUsers = (query: string, excludeUserId: string) =>
  db("users")
    .select("id", "name", "email")
    .where(function () {
      this.where("email", "ilike", `%${query}%`).orWhere("name", "ilike", `%${query}%`);
    })
    .whereNot("id", excludeUserId)
    .limit(10);
