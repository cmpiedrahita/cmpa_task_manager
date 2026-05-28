import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import db from "../db";

export const auditLog =
  (tableName: string, action: string) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
      if (res.statusCode < 400 && req.authUser) {
        db("audit_log")
          .insert({
            table_name: tableName,
            action,
            new_data: JSON.stringify(body),
            old_data: req.body ? JSON.stringify(req.body) : null,
            user_id: req.authUser.id,
          })
          .catch(() => {});
      }
      return originalJson(body);
    };

    next();
  };
