import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import './config/dotenv.js'

// Import routes
import gamesRouter from './routes/games.js'
import rsvpsRouter from './routes/rsvps.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// API routes
app.use('/api/games', gamesRouter)
app.use('/api', rsvpsRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '../client/dist')
  app.use(express.static(publicPath))

  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
})
