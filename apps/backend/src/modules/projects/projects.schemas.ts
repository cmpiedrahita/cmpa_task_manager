import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(1000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["active", "archived"]).optional(),
});
