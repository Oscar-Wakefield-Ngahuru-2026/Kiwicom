import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

const sharedPaths = {
  migrations: { directory: path.join(__dirname, 'migrations') },
  seeds: { directory: path.join(__dirname, 'seeds') },
}

const pgConnection = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
}

export default {
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
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
    ...sharedPaths,
  },
}
