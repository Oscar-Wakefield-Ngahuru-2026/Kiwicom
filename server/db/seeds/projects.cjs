exports.seed = async function (knex) {
  //Wipe exisiting rows so seed is re-runable.
  // below is Dummy seeds that will be replaced by actual data
  // using dummy seeds to test that it works

  await knex('projects').del()

  await knex('projects').insert([{
    name: 'Test Project One',
    description: 'A placeholder project for veryifying the seed runs.',
    github_url:'https://github.com/example/test-project-one',
    owner_name: 'example',
  },
  {
    name: 'Test Project Two',
    description: 'Another placeholder while we wait on real data.',
    github_url: 'https://github.com/example/test-project-two',
    owner_name: 'example',
  }
 ]

)
}