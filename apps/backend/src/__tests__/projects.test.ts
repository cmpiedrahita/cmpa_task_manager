import request from "supertest";
import app from "../index";
import db from "../db";

const testUser = {
  name: "Projects Test User",
  email: `projects_${Date.now()}@cmpa.dev`,
  password: "Test1234!",
};

let accessToken: string;
let projectId: string;

beforeAll(async () => {
  const res = await request(app).post("/api/auth/register").send(testUser);
  accessToken = res.body.accessToken;
});

afterAll(async () => {
  await db("projects").where("id", projectId).delete().catch(() => {});
  await db("users").where("email", testUser.email).delete();
  await db.destroy();
});

describe("POST /api/projects", () => {
  it("crea un proyecto y lo retorna", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Proyecto Test", description: "Descripción de prueba" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Proyecto Test");
    projectId = res.body.id;
  });

  it("retorna 400 si falta el nombre", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ description: "Sin nombre" });
    expect(res.status).toBe(400);
  });

  it("retorna 401 sin token", async () => {
    const res = await request(app).post("/api/projects").send({ name: "Test" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/projects", () => {
  it("retorna lista de proyectos del usuario", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /api/projects/:id", () => {
  it("retorna el proyecto por id", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(projectId);
  });

  it("retorna 404 si no existe", async () => {
    const res = await request(app)
      .get("/api/projects/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/projects/:id", () => {
  it("actualiza el proyecto", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Proyecto Actualizado" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Proyecto Actualizado");
  });
});

describe("DELETE /api/projects/:id", () => {
  it("elimina el proyecto", async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(204);
  });
});
