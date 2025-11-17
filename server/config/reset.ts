import { readFile } from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

import { pool } from "./database.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database schema
const createTablesQuery = `
  DROP TABLE IF EXISTS rsvps;
  DROP TABLE IF EXISTS games;
  DROP TABLE IF EXISTS users;

  -- Users Table
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Games Table
  CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    organizer_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    sport_type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    max_capacity INTEGER NOT NULL,
    current_capacity INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT future_scheduled_at CHECK (scheduled_at > CURRENT_TIMESTAMP),
    CONSTRAINT max_capacity_minimum CHECK (max_capacity >= 2),
    CONSTRAINT valid_capacity CHECK (current_capacity >= 0 AND current_capacity <= max_capacity)
  );

  -- RSVPs Table (Junction Table)
  CREATE TABLE rsvps (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(game_id, user_id)
  );

  -- Indexes for performance
  CREATE INDEX idx_games_scheduled_at ON games(scheduled_at);
  CREATE INDEX idx_games_sport_type ON games(sport_type);
  CREATE INDEX idx_games_location ON games(location);
  CREATE INDEX idx_games_organizer ON games(organizer_id);
  CREATE INDEX idx_rsvps_game ON rsvps(game_id);
  CREATE INDEX idx_rsvps_user ON rsvps(user_id);

  -- Trigger to update 'updated_at' timestamp
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
  END;
  $$ language 'plpgsql';

  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_rsvps_updated_at BEFORE UPDATE ON rsvps
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`

interface User {
  email: string
  name: string
  password_hash: string
}

interface Game {
  organizer_id: number
  title: string
  sport_type: string
  location: string
  scheduled_at: string
  timezone: string
  max_capacity: number
  description: string
}

interface RSVP {
  game_id: number
  user_id: number
}

async function loadSeedData() {
  try {
    const usersPath = path.join(__dirname, "../data/users.json")
    const gamesPath = path.join(__dirname, "../data/games.json")
    const rsvpsPath = path.join(__dirname, "../data/rsvps.json")

    const usersData = await readFile(usersPath, "utf-8")
    const gamesData = await readFile(gamesPath, "utf-8")
    const rsvpsData = await readFile(rsvpsPath, "utf-8")

    return {
      users: JSON.parse(usersData) as User[],
      games: JSON.parse(gamesData) as Game[],
      rsvps: JSON.parse(rsvpsData) as RSVP[]
    }
  } catch (error) {
    console.error("❌ Error loading seed data:", error)
    throw error
  }
}

async function seedDatabase(users: User[], games: Game[], rsvps: RSVP[]) {
  // Insert users
  for (const user of users) {
    await pool.query(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)`,
      [user.email, user.name, user.password_hash]
    )
  }
  console.log(`✅ Inserted ${users.length} users`)

  // Insert games
  for (const game of games) {
    await pool.query(
      `INSERT INTO games (organizer_id, title, sport_type, location, scheduled_at, timezone, max_capacity, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        game.organizer_id,
        game.title,
        game.sport_type,
        game.location,
        game.scheduled_at,
        game.timezone,
        game.max_capacity,
        game.description
      ]
    )
  }
  console.log(`✅ Inserted ${games.length} games`)

  // Insert RSVPs
  for (const rsvp of rsvps) {
    await pool.query(
      `INSERT INTO rsvps (game_id, user_id)
       VALUES ($1, $2)`,
      [rsvp.game_id, rsvp.user_id]
    )
  }
  console.log(`✅ Inserted ${rsvps.length} RSVPs`)
}

async function reset() {
  try {
    console.log("🗑️  Dropping existing tables...")
    console.log("🏗️  Creating tables...")
    await pool.query(createTablesQuery)
    console.log("✅ Tables created successfully")

    console.log("📖 Loading seed data...")
    const { users, games, rsvps } = await loadSeedData()

    console.log("🌱 Seeding database...")
    await seedDatabase(users, games, rsvps)
    console.log("✅ Database seeded successfully")

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error("❌ Error resetting database:", error)
    await pool.end()
    process.exit(1)
  }
}

reset()
