import * as repo from "./members.repository";
import * as projectsRepo from "../projects/projects.repository";
import db from "../../db";

export const getMembers = (projectId: string) => repo.findMembers(projectId);

export const getPendingInvitations = (userId: string) => repo.findPendingInvitations(userId);

export const invite = async (projectId: string, targetUserId: string, requesterId: string) => {
  const project = await projectsRepo.findById(projectId);
  if (!project) throw new Error("NOT_FOUND");
  if (project.owner_id !== requesterId) throw new Error("FORBIDDEN");

  const existing = await repo.findMembership(projectId, targetUserId);
  if (existing) throw new Error("ALREADY_INVITED");

  return repo.invite(projectId, targetUserId);
};

export const respond = async (invitationId: string, userId: string, status: "accepted" | "rejected") => {
  const invitation = await db("project_members").where({ id: invitationId, user_id: userId }).first();
  if (!invitation) throw new Error("NOT_FOUND");
  return repo.updateStatus(invitationId, status);
};

export const searchUsers = (query: string, excludeUserId: string) =>
  repo.searchUsers(query, excludeUserId);
