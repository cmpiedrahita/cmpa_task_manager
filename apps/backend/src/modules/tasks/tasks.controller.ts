import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import * as tasksService from "./tasks.service";

const handleError = (e: unknown, res: Response) => {
  const msg = e instanceof Error ? e.message : "ERROR";
  if (msg === "NOT_FOUND") return res.status(404).json({ error: "Tarea no encontrada" });
  if (msg === "PROJECT_NOT_FOUND") return res.status(404).json({ error: "Proyecto no encontrado" });
  if (msg === "FORBIDDEN") return res.status(403).json({ error: "Sin permisos" });
  return res.status(500).json({ error: "Error interno" });
};

export const getByProject = async (req: AuthRequest, res: Response) => {
  const tasks = await tasksService.getByProject(req.params.projectId, req.query as Record<string, string>);
  res.json(tasks);
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const task = await tasksService.getById(req.params.id);
    res.json(task);
  } catch (e) { handleError(e, res); }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const task = await tasksService.create(req.params.projectId, req.body, req.user!.id, req.user!.role);
    res.status(201).json(task);
  } catch (e) { handleError(e, res); }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const task = await tasksService.update(req.params.id, req.body, req.user!.id, req.user!.role);
    res.json(task);
  } catch (e) { handleError(e, res); }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    await tasksService.remove(req.params.id, req.user!.id, req.user!.role);
    res.status(204).send();
  } catch (e) { handleError(e, res); }
};
