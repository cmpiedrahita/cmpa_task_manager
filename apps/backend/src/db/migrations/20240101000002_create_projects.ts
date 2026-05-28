import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("projects", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("name", 150).notNullable();
    t.text("description");
    t.uuid("owner_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.enum("status", ["active", "archived"]).notNullable().defaultTo("active");
    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("projects");
}
