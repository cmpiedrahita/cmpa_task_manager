import { Router } from "express";
import { authenticate, AuthRequest } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { auditLog } from "../../middleware/auditLog";
import { createTaskSchema, updateTaskSchema } from "./tasks.schemas";
import * as tasksController from "./tasks.controller";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /tasks/all:
 *   get:
 *     summary: Obtener todas las tareas del usuario
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las tareas
 */
router.get("/all", authenticate, async (req: AuthRequest, res) => {
  const { findAllByUser } = await import("./tasks.repository");
  const tasks = await findAllByUser(req.user!.id, req.user!.role);
  res.json(tasks);
});

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestión de tareas por proyecto
 */

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   get:
 *     summary: Listar tareas de un proyecto
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, in_review, done]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tareas
 */
router.get("/", authenticate, tasksController.getByProject);

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   post:
 *     summary: Crear tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               due_date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tarea creada
 */
router.post("/", authenticate, validate(createTaskSchema), auditLog("tasks", "CREATE"), tasksController.create);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Actualizar tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, in_review, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               due_date:
 *                 type: string
 *               assignee_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tarea actualizada
 */
router.patch("/:id", authenticate, validate(updateTaskSchema), auditLog("tasks", "UPDATE"), tasksController.update);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Eliminar tarea
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Eliminada
 */
router.delete("/:id", authenticate, auditLog("tasks", "DELETE"), tasksController.remove);

export default router;
