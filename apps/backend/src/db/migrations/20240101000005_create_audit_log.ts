import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("audit_log", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("user_id").references("id").inTable("users").onDelete("SET NULL");
    t.string("entity", 50).notNullable();
    t.uuid("entity_id").notNullable();
    t.string("action", 20).notNullable();
    t.jsonb("changes");
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("audit_log");
}
