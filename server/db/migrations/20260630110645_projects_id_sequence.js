/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
    CREATE SEQUENCE IF NOT EXISTS projects_id_seq START WITH 2000;
    ALTER TABLE projects ALTER COLUMN id SET DEFAULT nextval('projects_id_seq');
    `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`
    ALTER TABLE projects ALTER COLUMN id DROP DEFAULT;
    DROP SEQUENCE IF EXISTS projects_id_seq;
    `)
}
