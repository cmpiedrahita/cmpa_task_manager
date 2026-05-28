import request from "supertest";
import app from "../index";
import db from "../db";

const testUser = {
  name: "Tasks Test User",
  email: `tasks_${Date.now()}@cmpa.dev`,
  password: "Test1234!",
};

let accessToken: string;
let projectId: string;
let taskId: string;

beforeAll(async () => {
  const authRes = await request(app).post("/api/auth/register").send(testUser);
  accessToken = authRes.body.accessToken;

  const projectRes = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ name: "Proyecto para tareas" });
  projectId = projectRes.body.id;
});

afterAll(async () => {
  await db("projects").where("id", projectId).delete().catch(() => {});
  await db("users").where("email", testUser.email).delete();
  await db.destroy();
});

describe("POST /api/projects/:projectId/tasks", () => {
  it("crea una tarea en el proyecto", async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Tarea de prueba", priority: "high", status: "todo" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Tarea de prueba");
    taskId = res.body.id;
  });

  it("retorna 400 si falta el título", async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ priority: "high" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/projects/:projectId/tasks", () => {
  it("retorna tareas del proyecto", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("filtra por status", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks?status=todo`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    res.body.forEach((t: { status: string }) => expect(t.status).toBe("todo"));
  });

  it("filtra por priority", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks?priority=high`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    res.body.forEach((t: { priority: string }) => expect(t.priority).toBe("high"));
  });
});

describe("PATCH /api/tasks/:id", () => {
  it("actualiza el status de la tarea", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "in_progress" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("in_progress");
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("elimina la tarea", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(204);
  });
});
