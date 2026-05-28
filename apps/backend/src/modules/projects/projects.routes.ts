import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { auditLog } from "../../middleware/auditLog";
import { createProjectSchema, updateProjectSchema } from "./projects.schemas";
import * as projectsController from "./projects.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Gestión de proyectos
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Listar proyectos
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
router.get("/", authenticate, projectsController.getAll);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Obtener proyecto por ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: No encontrado
 */
router.get("/:id", authenticate, projectsController.getById);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Crear proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proyecto creado
 */
router.post("/", authenticate, validate(createProjectSchema), auditLog("projects", "CREATE"), projectsController.create);

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Actualizar proyecto
 *     tags: [Projects]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, archived]
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 */
router.patch("/:id", authenticate, validate(updateProjectSchema), auditLog("projects", "UPDATE"), projectsController.update);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Eliminar proyecto
 *     tags: [Projects]
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
 *         description: Eliminado
 */
router.delete("/:id", authenticate, auditLog("projects", "DELETE"), projectsController.remove);

export default router;
