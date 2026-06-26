export async function seed(knex) {
  // Delete in reverse Foreign Key order
  await knex('bookmarks').del()
  await knex('issues').del()
  await knex('projects').del()
  await knex('profiles').del()

  await knex('profiles').insert([
    {
      id: 'user-001',
      github_username: 'Ivonnita',
      avatar_url: 'https://avatars.githubusercontent.com/u/1',
      bio: 'Full stack dev',
    },
    {
      id: 'user-002',
      github_username: 'henryn289',
      avatar_url: 'https://avatars.githubusercontent.com/u/2',
      bio: 'Backend and vite focused',
    },
    {
      id: 'user-003',
      github_username: 'serinacode',
      avatar_url: 'https://avatars.githubusercontent.com/u/3',
      bio: 'Frontend and tailwind proffessional',
    },
  ])

  await knex('projects').insert([
    {
      id: 1001,
      full_name: 'Ivonnita/kiwicom',
      description: 'Community hub for NZ devs',
      html_url: 'https://github.com/Ivonnita/kiwicom',
      primary_language: 'TypeScript',
      topics: ['react', 'open-source'],
      stars: 142,
      open_issues_count: 3,
      is_open_source: true,
    },
    {
      id: 1002,
      full_name: 'henryn289/kiwi-api',
      description: 'REST API for NZ projects',
      html_url: 'https://github.com/henryn289/kiwi-api',
      primary_language: 'JavaScript',
      topics: ['node', 'express'],
      stars: 108,
      open_issues_count: 1,
      is_open_source: true,
    },
    {
      id: 1003,
      full_name: 'serinacode/ui-kit',
      description: 'Component library',
      html_url: 'https://github.com/serinacode/ui-kit',
      primary_language: 'TypeScript',
      topics: ['react', 'tailwind'],
      stars: 733,
      open_issues_count: 0,
      is_open_source: false,
    },
  ])

  await knex('issues').insert([
    {
      id: 2001,
      project_id: 1001,
      title: 'Add search bar',
      html_url: 'https://github.com/Ivonnita/kiwicom/issues/1',
      labels: ['good first issue'],
      state: 'open',
    },
    {
      id: 2002,
      project_id: 1001,
      title: 'Fix mobile layout',
      html_url: 'https://github.com/Ivonnita/kiwicom/issues/2',
      labels: ['bug'],
      state: 'open',
    },
    {
      id: 2003,
      project_id: 1002,
      title: 'Add auth middleware',
      html_url: 'https://github.com/henryn289/kiwi-api/issues/1',
      labels: ['help wanted'],
      state: 'open',
    },
  ])

  await knex('bookmarks').insert([
    { user_id: 'user-001', project_id: 1002 },
    { user_id: 'user-002', project_id: 1001 },
    { user_id: 'user-003', project_id: 1001 },
  ])
}
