import { Request, Response } from "express";
import * as authService from "./auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body.name, req.body.email, req.body.password);
    res.status(201).json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "ERROR";
    if (msg === "EMAIL_TAKEN") res.status(409).json({ error: "El email ya está registrado" });
    else res.status(500).json({ error: "Error interno" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "ERROR";
    if (msg === "INVALID_CREDENTIALS") res.status(401).json({ error: "Credenciales inválidas" });
    else res.status(500).json({ error: "Error interno" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: "Refresh token inválido o expirado" });
  }
};

export const me = async (req: Request, res: Response) => {
  res.json((req as unknown as { user: unknown }).user);
};
