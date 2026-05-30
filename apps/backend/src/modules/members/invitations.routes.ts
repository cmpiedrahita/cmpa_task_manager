import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as membersController from "./members.controller";

const router = Router();

/**
 * @swagger
 * /invitations:
 *   get:
 *     summary: Ver invitaciones pendientes del usuario autenticado
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de invitaciones pendientes
 *
 * /invitations/{id}:
 *   patch:
 *     summary: Aceptar o rechazar una invitación
 *     tags: [Members]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Invitación actualizada
 *
 * /users/search:
 *   get:
 *     summary: Buscar usuarios por nombre o email
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de usuarios encontrados
 */

router.get("/invitations", authenticate, membersController.getPendingInvitations);
router.patch("/invitations/:id", authenticate, membersController.respond);
router.get("/users/search", authenticate, membersController.searchUsers);

export default router;
