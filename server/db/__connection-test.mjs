import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const url = process.env.DATABASE_URL
if (!url) {
  console.error('No DATABASE_URL loaded')
  process.exit(1)
}

const masked = url.replace(/:\/\/([^:]+):[^@]+@/, '://$1:***MASKED***@')
console.log('Connecting to:', masked)

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  console.log('✅ CONNECTED — auth succeeded')
  const r = await client.query('select current_user, current_database()')
  console.log('   Connected as:', r.rows[0])
  await client.end()
} catch (e) {
  console.error('❌ FAILED')
  console.error('   message:', e.message)
  console.error('   code:   ', e.code)
  console.error('   severity:', e.severity)
  console.error('   detail: ', e.detail)
  process.exit(1)
}
