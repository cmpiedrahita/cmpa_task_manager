import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import * as membersService from "./members.service";

const handleError = (e: unknown, res: Response) => {
  const msg = e instanceof Error ? e.message : "ERROR";
  if (msg === "NOT_FOUND") return res.status(404).json({ error: "No encontrado" });
  if (msg === "FORBIDDEN") return res.status(403).json({ error: "Sin permisos" });
  if (msg === "ALREADY_INVITED") return res.status(409).json({ error: "Usuario ya invitado" });
  return res.status(500).json({ error: "Error interno" });
};

export const getMembers = async (req: AuthRequest, res: Response) => {
  const members = await membersService.getMembers(req.params.projectId);
  res.json(members);
};

export const getPendingInvitations = async (req: AuthRequest, res: Response) => {
  const invitations = await membersService.getPendingInvitations(req.authUser!.id);
  res.json(invitations);
};

export const invite = async (req: AuthRequest, res: Response) => {
  try {
    const invitation = await membersService.invite(req.params.projectId, req.body.userId, req.authUser!.id);
    res.status(201).json(invitation);
  } catch (e) { handleError(e, res); }
};

export const respond = async (req: AuthRequest, res: Response) => {
  try {
    const result = await membersService.respond(req.params.id, req.authUser!.id, req.body.status);
    res.json(result);
  } catch (e) { handleError(e, res); }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  const users = await membersService.searchUsers(String(req.query.q || ""), req.authUser!.id);
  res.json(users);
};
