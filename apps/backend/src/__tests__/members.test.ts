import request from "supertest";
import app from "../index";
import db from "../db";

const owner = {
  name: "Members Owner",
  email: `members_owner_${Date.now()}@cmpa.dev`,
  password: "Test1234!",
};

const member = {
  name: "Members User",
  email: `members_user_${Date.now()}@cmpa.dev`,
  password: "Test1234!",
};

let ownerToken: string;
let memberToken: string;
let memberId: string;
let projectId: string;
let invitationId: string;

beforeAll(async () => {
  const ownerRes = await request(app).post("/api/auth/register").send(owner);
  ownerToken = ownerRes.body.accessToken;

  const memberRes = await request(app).post("/api/auth/register").send(member);
  memberToken = memberRes.body.accessToken;
  memberId = memberRes.body.user.id;

  const projectRes = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({ name: "Proyecto de equipo", type: "team" });
  projectId = projectRes.body.id;
});

afterAll(async () => {
  await db("projects").where("id", projectId).delete().catch(() => {});
  await db("users").where("email", owner.email).delete();
  await db("users").where("email", member.email).delete();
});

describe("GET /api/users/search", () => {
  it("retorna usuarios que coinciden con la búsqueda", async () => {
    const res = await request(app)
      .get(`/api/users/search?q=${member.name.split(" ")[0]}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("retorna 401 sin token", async () => {
    const res = await request(app).get("/api/users/search?q=test");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/projects/:projectId/members", () => {
  it("invita a un usuario al proyecto", async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ userId: memberId });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
    invitationId = res.body.id;
  });

  it("retorna 409 si el usuario ya fue invitado", async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ userId: memberId });
    expect(res.status).toBe(409);
  });

  it("retorna 403 si no es el owner", async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ userId: memberId });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/invitations", () => {
  it("retorna invitaciones pendientes del usuario", async () => {
    const res = await request(app)
      .get("/api/invitations")
      .set("Authorization", `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("retorna 401 sin token", async () => {
    const res = await request(app).get("/api/invitations");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/invitations/:id", () => {
  it("acepta la invitación", async () => {
    const res = await request(app)
      .patch(`/api/invitations/${invitationId}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ status: "accepted" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("accepted");
  });

  it("retorna 404 si la invitación no existe", async () => {
    const res = await request(app)
      .patch("/api/invitations/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ status: "accepted" });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/projects/:projectId/members", () => {
  it("retorna los miembros aceptados del proyecto", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("retorna 401 sin token", async () => {
    const res = await request(app).get(`/api/projects/${projectId}/members`);
    expect(res.status).toBe(401);
  });
});
