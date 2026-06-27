// This migration adds a Postgres sequence to projects.id so the addProject route
// can insert rows without supplying an id (Postgres assigns one from the sequence).
//
// The SQL is Postgres-specific (SEQUENCE / nextval are not in SQLite), so the
// migration is a no-op on non-pg dialects. Our test env uses SQLite in-memory
// and doesn't need the sequence — the `.integer('id').primary()` from the init
// migration is enough for tests since they always supply an explicit id.
export async function up(knex) {
  if (knex.client.config.client !== 'pg') return
  await knex.raw(`
    CREATE SEQUENCE IF NOT EXISTS projects_id_seq OWNED BY projects.id;
    ALTER TABLE projects ALTER COLUMN id SET DEFAULT nextval('projects_id_seq');
    SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 0) + 1, false);
  `)
}

export async function down(knex) {
  if (knex.client.config.client !== 'pg') return
  await knex.raw(`
    ALTER TABLE projects ALTER COLUMN id DROP DEFAULT;
    DROP SEQUENCE IF EXISTS projects_id_seq;
  `)
}
