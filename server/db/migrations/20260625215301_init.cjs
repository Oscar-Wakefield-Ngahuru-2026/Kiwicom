exports.up = async function(knex) {
  await knex.schema.createTable('profiles', (table) => {
    table.string('id').primary()
    table.string('github_username').notNullable()
    table.text('avatar_url')
    table.text('bio')
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('projects', (table) => {
    table.integer('id').primary()
    table.string('full_name').notNullable()
    table.text('description')
    table.text('html_url').notNullable()
    table.text('homepage')
    table.string('primary_language')
    table.specificType('topics', 'text[]')
    table.integer('stars').defaultTo(0)
    table.integer('open_issues_count').defaultTo(0)
    table.boolean('is_open_source').defaultTo(false)
    table.text('license')
    table.text('readme')
    table.text('ai_summary')
    table.timestamp('ai_summary_at')
    table.timestamp('last_synced_at')
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('issues', (table) => {
    table.integer('id').primary()
    table.integer('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE')
    table.string('title').notNullable()
    table.text('html_url').notNullable()
    table.specificType('labels', 'text[]')
    table.string('state').notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('bookmarks', (table) => {
    table.string('user_id').notNullable().references('id').inTable('profiles').onDelete('CASCADE')
    table.integer('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE')
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.primary(['user_id', 'project_id'])
  })
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('bookmarks')
  await knex.schema.dropTableIfExists('issues')
  await knex.schema.dropTableIfExists('projects')
  await knex.schema.dropTableIfExists('profiles')
}
