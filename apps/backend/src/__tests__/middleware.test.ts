import { describe, it, expect } from "@jest/globals";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { Request, Response, NextFunction } from "express";

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe("authenticate middleware", () => {
  it("retorna 401 si no hay token", () => {
    const req = { headers: {} } as AuthRequest;
    const res = mockRes();
    authenticate(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("retorna 401 con token inválido", () => {
    const req = { headers: { authorization: "Bearer tokeninvalido" } } as AuthRequest;
    const res = mockRes();
    authenticate(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe("requireAdmin middleware", () => {
  it("retorna 403 si el usuario no es admin", () => {
    const req = { authUser: { id: "1", email: "a@b.com", role: "member" } } as AuthRequest;
    const res = mockRes();
    requireAdmin(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("llama next si el usuario es admin", () => {
    const req = { authUser: { id: "1", email: "a@b.com", role: "admin" } } as AuthRequest;
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
