import type { Knex } from "knex";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex): Promise<void> {
  await knex("audit_log").del();
  await knex("task_comments").del();
  await knex("tasks").del();
  await knex("projects").del();
  await knex("users").del();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const [admin, alice, bob] = await knex("users").insert([
    { name: "Admin User", email: "admin@cmpa.dev", password_hash: passwordHash, role: "admin" },
    { name: "Alice Martínez", email: "alice@cmpa.dev", password_hash: passwordHash, role: "member" },
    { name: "Bob Torres", email: "bob@cmpa.dev", password_hash: passwordHash, role: "member" },
  ]).returning("*");

  const [ecommerce, mobile] = await knex("projects").insert([
    {
      name: "E-commerce Redesign",
      description: "Rediseño completo de la plataforma de ventas online.",
      owner_id: admin.id,
      status: "active",
    },
    {
      name: "Mobile App v2",
      description: "Segunda versión de la aplicación móvil con nuevas funcionalidades.",
      owner_id: alice.id,
      status: "active",
    },
  ]).returning("*");

  await knex("tasks").insert([
    // E-commerce tasks
    { title: "Diseñar wireframes del checkout", project_id: ecommerce.id, assignee_id: alice.id, status: "done", priority: "high", position: 0, due_date: "2024-07-15" },
    { title: "Implementar pasarela de pagos", project_id: ecommerce.id, assignee_id: bob.id, status: "in_progress", priority: "critical", position: 0, due_date: "2024-08-01" },
    { title: "Optimizar imágenes de productos", project_id: ecommerce.id, assignee_id: alice.id, status: "todo", priority: "low", position: 0 },
    { title: "Configurar CDN", project_id: ecommerce.id, assignee_id: bob.id, status: "todo", priority: "medium", position: 1 },
    { title: "Testing de regresión", project_id: ecommerce.id, assignee_id: null, status: "in_review", priority: "high", position: 0, due_date: "2024-07-30" },
    // Mobile tasks
    { title: "Diseñar sistema de notificaciones", project_id: mobile.id, assignee_id: bob.id, status: "done", priority: "medium", position: 0 },
    { title: "Integrar autenticación biométrica", project_id: mobile.id, assignee_id: alice.id, status: "in_progress", priority: "high", position: 0, due_date: "2024-08-10" },
    { title: "Migrar a React Native 0.74", project_id: mobile.id, assignee_id: bob.id, status: "todo", priority: "critical", position: 0 },
    { title: "Escribir tests unitarios", project_id: mobile.id, assignee_id: null, status: "todo", priority: "medium", position: 1 },
  ]);
}
