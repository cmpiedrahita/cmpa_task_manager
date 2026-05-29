import request from "supertest";
import app from "../index";
import db from "../db";

const testUser = {
  name: "Test User",
  email: `test_${Date.now()}@cmpa.dev`,
  password: "Test1234!",
};

let accessToken: string;
let refreshToken: string;

afterAll(async () => {
  await db("users").where("email", testUser.email).delete();
  await db.destroy();
});

describe("POST /api/auth/register", () => {
  it("crea un usuario nuevo y retorna tokens", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.user.email).toBe(testUser.email);
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it("retorna 409 si el email ya existe", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(409);
  });

  it("retorna 400 si el password no cumple requisitos", async () => {
    const res = await request(app).post("/api/auth/register").send({ ...testUser, password: "weak" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("retorna tokens con credenciales válidas", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("retorna 401 con credenciales inválidas", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("retorna 401 con email inexistente", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "noexiste@cmpa.dev",
      password: "Test1234!",
    });
    expect(res.status).toBe(401);
  });

  it("retorna 400 si falta el email", async () => {
    const res = await request(app).post("/api/auth/login").send({ password: "Test1234!" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("retorna el usuario autenticado", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it("retorna 401 sin token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/refresh", () => {
  it("retorna nuevos tokens con refresh token válido", async () => {
    const res = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("retorna 401 con refresh token inválido", async () => {
    const res = await request(app).post("/api/auth/refresh").send({ refreshToken: "invalid" });
    expect(res.status).toBe(401);
  });
});
