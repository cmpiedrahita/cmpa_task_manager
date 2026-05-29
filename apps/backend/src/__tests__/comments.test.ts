import request from "supertest";
import app from "../index";
import db from "../db";

const testUser = {
  name: "Comments Test User",
  email: `comments_${Date.now()}@cmpa.dev`,
  password: "Test1234!",
};

let accessToken: string;
let projectId: string;
let taskId: string;
let commentId: string;

beforeAll(async () => {
  const authRes = await request(app).post("/api/auth/register").send(testUser);
  accessToken = authRes.body.accessToken;

  const projectRes = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ name: "Proyecto para comentarios" });
  projectId = projectRes.body.id;

  const taskRes = await request(app)
    .post(`/api/projects/${projectId}/tasks`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ title: "Tarea para comentarios", priority: "low", status: "todo" });
  taskId = taskRes.body.id;
});

afterAll(async () => {
  await db("projects").where("id", projectId).delete().catch(() => {});
  await db("users").where("email", testUser.email).delete();
});

describe("POST /api/tasks/:taskId/comments", () => {
  it("crea un comentario en la tarea", async () => {
    const res = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "Este es un comentario de prueba" });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe("Este es un comentario de prueba");
    commentId = res.body.id;
  });

  it("retorna 400 si falta el contenido", async () => {
    const res = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("retorna 401 sin token", async () => {
    const res = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .send({ content: "Sin auth" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/tasks/:taskId/comments", () => {
  it("retorna los comentarios de la tarea", async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("retorna 401 sin token", async () => {
    const res = await request(app).get(`/api/tasks/${taskId}/comments`);
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/tasks/:taskId/comments/:id", () => {
  it("elimina el comentario", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}/comments/${commentId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(204);
  });

  it("retorna 401 sin token", async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}/comments/${commentId}`);
    expect(res.status).toBe(401);
  });
});
