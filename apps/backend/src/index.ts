import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./modules/auth/auth.routes";
import projectsRoutes from "./modules/projects/projects.routes";
import tasksRoutes from "./modules/tasks/tasks.routes";
import commentsRoutes from "./modules/comments/comments.routes";
import membersRoutes from "./modules/members/members.routes";
import invitationsRoutes from "./modules/members/invitations.routes";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// Swagger
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "CMPA Task Manager API", version: "1.0.0" },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/modules/**/*.routes.ts"],
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/projects/:projectId/tasks", tasksRoutes);
app.use("/api/projects/:projectId/members", membersRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/tasks/:taskId/comments", commentsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api", invitationsRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Docs: http://localhost:${PORT}/api/docs`);
  });
}

export default app;
