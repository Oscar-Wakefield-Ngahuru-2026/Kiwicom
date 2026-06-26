export async function up(knex) {
  await knex.raw(`
    CREATE SEQUENCE IF NOT EXISTS projects_id_seq OWNED BY projects.id;
    ALTER TABLE projects ALTER COLUMN id SET DEFAULT nextval('projects_id_seq');
    SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 0) + 1, false);
  `)
}

export async function down(knex) {
  await knex.raw(`
    ALTER TABLE projects ALTER COLUMN id DROP DEFAULT;
    DROP SEQUENCE IF EXISTS projects_id_seq;
  `)
}
