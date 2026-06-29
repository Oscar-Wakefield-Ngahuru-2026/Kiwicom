export async function up(knex) {
  // Add the editable fields to the profiles table
  await knex.schema.alterTable('profiles', (table) => {
    table.text('role')
    table.text('location')
    table.text('github_link')
    table.specificType('hobbies', 'text[]').defaultTo('{}')
  })

  // Create the social_links table — one row per link, belonging to a profile
  await knex.schema.createTable('social_links', (table) => {
    table.increments('id').primary()
    table
      .string('profile_id')
      .notNullable()
      .references('id')
      .inTable('profiles')
      .onDelete('CASCADE')
    table.string('label').notNullable()
    table.text('url').notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('social_links')
  await knex.schema.alterTable('profiles', (table) => {
    table.dropColumn('hobbies')
    table.dropColumn('github_link')
    table.dropColumn('location')
    table.dropColumn('role')
  })
}
