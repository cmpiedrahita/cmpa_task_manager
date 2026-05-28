import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("task_comments", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("task_id").notNullable().references("id").inTable("tasks").onDelete("CASCADE");
    t.uuid("author_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.text("content").notNullable();
    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("task_comments");
}
