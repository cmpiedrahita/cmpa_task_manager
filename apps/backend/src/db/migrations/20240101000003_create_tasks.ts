import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tasks", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("title", 200).notNullable();
    t.text("description");
    t.uuid("project_id").notNullable().references("id").inTable("projects").onDelete("CASCADE");
    t.uuid("assignee_id").references("id").inTable("users").onDelete("SET NULL");
    t.enum("status", ["todo", "in_progress", "in_review", "done"]).notNullable().defaultTo("todo");
    t.enum("priority", ["low", "medium", "high", "critical"]).notNullable().defaultTo("medium");
    t.date("due_date");
    t.integer("position").notNullable().defaultTo(0);
    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("tasks");
}
