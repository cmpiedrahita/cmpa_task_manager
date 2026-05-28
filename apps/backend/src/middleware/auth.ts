import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  authUser?: AuthUser;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Token requerido" });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as unknown as AuthUser;
    req.authUser = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.authUser?.role !== "admin") {
    res.status(403).json({ error: "Acceso denegado" });
    return;
  }
  next();
};
