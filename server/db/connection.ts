import knex from 'knex'

import config from './knexfile.js'

const env = process.env.NODE_ENV ?? 'development'
const envConfig = (config as Record<string, object>)[env]

if (!envConfig) {
  throw new Error(
    `No Knex config for NODE_ENV="${env}". Expected one of: ${Object.keys(config).join(', ')}`,
  )
}

if (env !== 'test' && !process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and fill in your Supabase connection string.',
  )
}

const db = knex(envConfig)

export default db
