
exports.up = async function(knex) {
  await knex.schema.createTable('projects', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.text('description').notNullable()
    table.text('github_url').notNullable()
    table.string('owner_name').notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })
  
};

exports.down = async function(knex) {
  await knex.schema.dropTable('projects')
  
};
