import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createCommentSchema } from "./comments.schemas";
import * as commentsController from "./comments.controller";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comentarios de tareas
 */

/**
 * @swagger
 * /tasks/{taskId}/comments:
 *   get:
 *     summary: Listar comentarios de una tarea
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de comentarios
 */
router.get("/", authenticate, commentsController.getByTask);

/**
 * @swagger
 * /tasks/{taskId}/comments:
 *   post:
 *     summary: Agregar comentario
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comentario creado
 */
router.post("/", authenticate, validate(createCommentSchema), commentsController.create);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Eliminar comentario
 *     tags: [Comments]
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
router.delete("/:id", authenticate, commentsController.remove);

export default router;
