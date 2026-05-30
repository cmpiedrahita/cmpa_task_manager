import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("projects", (t) => {
    t.enum("type", ["personal", "team"]).notNullable().defaultTo("personal");
  });

  await knex.schema.createTable("project_members", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("project_id").notNullable().references("id").inTable("projects").onDelete("CASCADE");
    t.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.enum("status", ["pending", "accepted", "rejected"]).notNullable().defaultTo("pending");
    t.timestamps(true, true);
    t.unique(["project_id", "user_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("project_members");
  await knex.schema.alterTable("projects", (t) => {
    t.dropColumn("type");
  });
}
