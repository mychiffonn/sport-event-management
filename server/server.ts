import path from "path"
import { fileURLToPath } from "url"

import cors from "cors"
import express from "express"

import "./config/dotenv.js"

import { pool } from "./config/database.js"
import gamesRouter from "./routes/games.js"
import rsvpsRouter from "./routes/rsvps.js"
import userRouter from "./routes/users.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL || "https://yourdomain.com"
      : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}
app.use(cors(corsOptions))
app.use(express.json())

// API routes
app.use("/api/games", gamesRouter)
app.use("/api/users", userRouter)
app.use("/api", rsvpsRouter)

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" })
})

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const publicPath = path.join(__dirname, "../client/dist")
  app.use(express.static(publicPath))

  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicPath, "index.html"))
  })
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
})

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`)

  // Stop accepting new connections
  server.close(async () => {
    console.log("HTTP server closed")

    try {
      await pool.end()
      console.log("Database connection pool closed")
      process.exit(0)
    } catch (error) {
      console.error("Error during graceful shutdown:", error)
      process.exit(1)
    }
  })

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout")
    process.exit(1)
  }, 10000)
}

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))
