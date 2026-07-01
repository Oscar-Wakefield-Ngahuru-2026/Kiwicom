/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('projects', (table) => {
    table
      .string('owner_profile_id')
      .references('id')
      .inTable('profiles')
      .onDelete('SET NULL')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('projects', (table) => {
    table.dropColumn('owner_profile_id')
  })
}
