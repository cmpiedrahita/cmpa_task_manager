import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as membersController from "./members.controller";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Gestión de miembros de proyectos
 */

/**
 * @swagger
 * /projects/{projectId}/members:
 *   get:
 *     summary: Listar miembros del proyecto
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de miembros aceptados
 *   post:
 *     summary: Invitar usuario al proyecto
 *     tags: [Members]
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
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invitación enviada
 *       403:
 *         description: Sin permisos
 *       409:
 *         description: Usuario ya invitado
 */

router.get("/", authenticate, membersController.getMembers);
router.post("/", authenticate, membersController.invite);

export default router;
