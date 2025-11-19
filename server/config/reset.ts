import { readFile } from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

import type { Game, RSVP } from "../types.js"
import { pool } from "./database.js"

const __filename = fileURLToPath(import.meta.url)
const __data_dir = path.join(path.dirname(__filename), "../data")

// Database schema - matches better-auth requirements
// Note: better-auth manages the 'user' table, we only manage games and rsvps
const createTablesQuery = `
  -- Drop our tables only (not better-auth's user table)
  DROP TABLE IF EXISTS rsvps CASCADE;
  DROP TABLE IF EXISTS games CASCADE;

  -- Games Table with string user IDs
  CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    organizer_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    sport_type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    max_capacity INTEGER NOT NULL,
    current_capacity INTEGER DEFAULT 0,
    description VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT max_capacity_minimum CHECK (max_capacity >= 2),
    CONSTRAINT valid_capacity CHECK (current_capacity >= 0 AND current_capacity <= max_capacity)
  );

  -- RSVPs Table with string user IDs
  CREATE TABLE rsvps (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
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

  CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_rsvps_updated_at BEFORE UPDATE ON rsvps
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  -- Trigger to prevent organizers from RSVPing to their own games
  CREATE OR REPLACE FUNCTION prevent_organizer_rsvp()
  RETURNS TRIGGER AS $$
  DECLARE
      game_organizer_id VARCHAR(255);
  BEGIN
      -- Get the organizer_id for the game
      SELECT organizer_id INTO game_organizer_id
      FROM games
      WHERE id = NEW.game_id;

      -- Check if the user trying to RSVP is the organizer
      IF game_organizer_id = NEW.user_id THEN
          RAISE EXCEPTION 'Organizers cannot RSVP to their own games';
      END IF;

      RETURN NEW;
  END;
  $$ language 'plpgsql';

  CREATE TRIGGER prevent_organizer_rsvp_trigger
      BEFORE INSERT OR UPDATE ON rsvps
      FOR EACH ROW EXECUTE FUNCTION prevent_organizer_rsvp();
`

async function loadSeedData() {
  try {
    const gamesPath = path.join(__data_dir, "games.json")
    const rsvpsPath = path.join(__data_dir, "rsvps.json")

    const gamesData = await readFile(gamesPath, "utf-8")
    const rsvpsData = await readFile(rsvpsPath, "utf-8")

    return {
      games: JSON.parse(gamesData) as Game[],
      rsvps: JSON.parse(rsvpsData) as RSVP[]
    }
  } catch (error) {
    console.error("❌ Error loading seed data:", error)
    throw error
  }
}

async function seedDatabase(games: Game[], rsvps: RSVP[]) {
  // Get existing users from better-auth to validate organizer IDs
  const usersResult = await pool.query(`SELECT id FROM "user"`)
  const existingUserIds = new Set(usersResult.rows.map((row) => row.id))

  console.log(`📋 Found ${existingUserIds.size} existing users in the database`)

  // Insert games (only if organizer exists)
  let insertedGames = 0
  for (const game of games) {
    if (!existingUserIds.has(game.organizer_id)) {
      console.log(
        `⚠️  Skipping game "${game.title}" - organizer ID "${game.organizer_id}" not found`
      )
      continue
    }

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
    insertedGames++
  }
  console.log(`✅ Inserted ${insertedGames} games (${games.length - insertedGames} skipped)`)

  // Insert RSVPs (only if user exists)
  let insertedRsvps = 0
  for (const rsvp of rsvps) {
    if (!existingUserIds.has(rsvp.user_id)) {
      console.log(`⚠️  Skipping RSVP - user ID "${rsvp.user_id}" not found`)
      continue
    }

    await pool.query(
      `INSERT INTO rsvps (game_id, user_id, status)
       VALUES ($1, $2, $3)`,
      [rsvp.game_id, rsvp.user_id, rsvp.status || "going"]
    )
    insertedRsvps++
  }
  console.log(`✅ Inserted ${insertedRsvps} RSVPs (${rsvps.length - insertedRsvps} skipped)`)

  // Update game capacities based on 'going' RSVPs
  await pool.query(`
    UPDATE games
    SET current_capacity = (
      SELECT COUNT(*)
      FROM rsvps
      WHERE rsvps.game_id = games.id
      AND rsvps.status = 'going'
    )
  `)
  console.log(`✅ Updated game capacities`)
}

async function reset() {
  try {
    console.log("🗑️  Dropping existing tables...")
    console.log("🏗️  Creating tables...")
    await pool.query(createTablesQuery)
    console.log("✅ Tables created successfully")

    console.log("📖 Loading seed data...")
    const { games, rsvps } = await loadSeedData()

    console.log("🌱 Seeding database...")
    console.log("ℹ️  Note: Users are managed by better-auth. Create test users via sign-up.")
    await seedDatabase(games, rsvps)
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
