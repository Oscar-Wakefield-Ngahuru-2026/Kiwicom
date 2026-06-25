import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const sessionUrl = process.env.DATABASE_URL
const txUrl = sessionUrl.replace(':5432/', ':6543/')

console.log('Testing Transaction pooler (port 6543) with same credentials...')
console.log('URL:', txUrl.replace(/:\/\/([^:]+):[^@]+@/, '://$1:***MASKED***@'))

const client = new pg.Client({
  connectionString: txUrl,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  console.log('✅ Transaction pooler CONNECTED')
  const r = await client.query('select current_user, current_database()')
  console.log('   Connected as:', r.rows[0])
  await client.end()
} catch (e) {
  console.error('❌ FAILED')
  console.error('   message:', e.message)
  console.error('   code:   ', e.code)
}
