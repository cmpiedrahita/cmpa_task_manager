import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import * as projectsService from "./projects.service";

const handleError = (e: unknown, res: Response) => {
  const msg = e instanceof Error ? e.message : "ERROR";
  if (msg === "NOT_FOUND") return res.status(404).json({ error: "Proyecto no encontrado" });
  if (msg === "FORBIDDEN") return res.status(403).json({ error: "Sin permisos" });
  return res.status(500).json({ error: "Error interno" });
};

export const getAll = async (req: AuthRequest, res: Response) => {
  const projects = await projectsService.getAll(req.user!.id, req.user!.role);
  res.json(projects);
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const project = await projectsService.getById(req.params.id);
    res.json(project);
  } catch (e) { handleError(e, res); }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const project = await projectsService.create(req.body, req.user!.id);
    res.status(201).json(project);
  } catch (e) { handleError(e, res); }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const project = await projectsService.update(req.params.id, req.body, req.user!.id, req.user!.role);
    res.json(project);
  } catch (e) { handleError(e, res); }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    await projectsService.remove(req.params.id, req.user!.id, req.user!.role);
    res.status(204).send();
  } catch (e) { handleError(e, res); }
};
