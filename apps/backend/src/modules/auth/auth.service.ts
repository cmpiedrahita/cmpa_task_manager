import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../../db";

const signTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
  return { accessToken, refreshToken };
};

export const register = async (name: string, email: string, password: string) => {
  const existing = await db("users").where({ email }).first();
  if (existing) throw new Error("EMAIL_TAKEN");

  const password_hash = await bcrypt.hash(password, 12);
  const [user] = await db("users")
    .insert({ name, email, password_hash })
    .returning(["id", "email", "role", "name"]);

  return { user, ...signTokens(user) };
};

export const login = async (email: string, password: string) => {
  const user = await db("users").where({ email }).first();
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  const { password_hash: _, ...safeUser } = user;
  return { user: safeUser, ...signTokens(user) };
};

export const refresh = async (token: string) => {
  const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };
  const user = await db("users").where({ id: payload.id }).first();
  if (!user) throw new Error("USER_NOT_FOUND");

  return signTokens(user);
};
