const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname,'..', '..', '.env') })

const sharedPaths = {
  migrations: { directory: path.join(__dirname, 'migrations') },
  seeds: { directory: path.join(__dirname, 'seeds') },
}

const pgConnection = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false},
}

module.exports = {
  development: {
    client: 'pg',
    connection: pgConnection,
    ...sharedPaths,
  },
  production: {
    client: 'pg',
    connection: pgConnection,
    ...sharedPaths,
  },
  test: {
    client: 'sqlite3',
    connection: { filename: ':memory:'},
    useNullAsDefault: true,
    ...sharedPaths,
  },
}