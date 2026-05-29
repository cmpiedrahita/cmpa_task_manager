import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import * as commentsService from "./comments.service";

const handleError = (e: unknown, res: Response) => {
  const msg = e instanceof Error ? e.message : "ERROR";
  if (msg === "NOT_FOUND") return res.status(404).json({ error: "Comentario no encontrado" });
  if (msg === "FORBIDDEN") return res.status(403).json({ error: "Sin permisos" });
  return res.status(500).json({ error: "Error interno" });
};

export const getByTask = async (req: AuthRequest, res: Response) => {
  const comments = await commentsService.getByTask(req.params.taskId);
  res.json(comments);
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const comment = await commentsService.create(req.params.taskId, req.authUser!.id, req.body.content);
    res.status(201).json(comment);
  } catch (e) { handleError(e, res); }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    await commentsService.remove(req.params.id, req.authUser!.id, req.authUser!.role);
    res.status(204).send();
  } catch (e) { handleError(e, res); }
};
