import './dotenv.js'
import pg from 'pg'

const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE,
  ssl: process.env.PGHOST ? { rejectUnauthorized: false } : false
}

export const pool = new pg.Pool(config)
