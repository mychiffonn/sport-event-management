import { Request, Response } from "express"

import { pool } from "../config/database.js"
import type { CreateGameInput, GameFilters, UpdateGameInput } from "../types.js"

// Get all games with optional filters
export const getGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sport_type, location, date_start, date_end, has_spots, search, sort } =
      req.query as GameFilters

    let query = "SELECT * FROM games WHERE 1=1"
    const params: (string | number | boolean)[] = []
    let paramCount = 1

    // search filter
    if (search) {
      query += ` AND (
      title ILIKE $${paramCount} OR
      description ILIKE $${paramCount} OR
      location ILIKE $${paramCount}
      )`
      params.push(`%${search}%`)
      paramCount++
    }

    if (sport_type) {
      query += ` AND sport_type = $${paramCount}`
      params.push(sport_type)
      paramCount++
    }

    if (location) {
      query += ` AND location ILIKE $${paramCount}`
      params.push(`%${location}%`)
      paramCount++
    }

    if (date_start) {
      query += ` AND scheduled_at >= $${paramCount}`
      params.push(date_start)
      paramCount++
    }

    if (date_end) {
      query += ` AND scheduled_at <= $${paramCount}`
      params.push(date_end)
      paramCount++
    }

    if (has_spots === "true" || has_spots === true) {
      query += " AND current_capacity < max_capacity"
    }

    let orderBy = " ORDER BY scheduled_at ASC"

    if (sort === "date-asc") {
      orderBy = "ORDER BY scheduled_at ASC"
    } else if (sort === "date-desc") {
      orderBy = "ORDER BY scheduled_at DESC"
    } else if (sort === "spots-desc") {
      orderBy = "ORDER BY (max_capacity - current_capacity) DESC"
    } else if (sort === "spots-asc") {
      orderBy = "ORDER BY (max_capacity - current_capacity) ASC"
    } else if (sort === "newest") {
      orderBy = "ORDER BY created_at DESC"
    } else if (sort === "oldest") {
      orderBy = "ORDER BY created_at ASC"
    }

    query += ` ${orderBy}`

    const result = await pool.query(query, params)
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching games:", error)
    res.status(500).json({ error: "Failed to fetch games" })
  }
}

// Get a single game by ID
export const getGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query("SELECT * FROM games WHERE id = $1", [id])

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Game not found" })
      return
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error("Error fetching game:", error)
    res.status(500).json({ error: "Failed to fetch game" })
  }
}

// Create a new game
export const createGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      sport_type,
      location,
      scheduled_at,
      timezone,
      max_capacity,
      description,
      organizer_id
    }: CreateGameInput = req.body

    // Validate required fields
    if (!title || !sport_type || !location || !scheduled_at || !timezone || !max_capacity) {
      res.status(400).json({ error: "Missing required fields" })
      return
    }

    const result = await pool.query(
      `INSERT INTO games (title, sport_type, location, scheduled_at, timezone, max_capacity, current_capacity, description, organizer_id)
       VALUES ($1, $2, $3, $4 AT TIME ZONE $5, $5, $6, 0, $7, $8)
       RETURNING *`,
      [title, sport_type, location, scheduled_at, timezone, max_capacity, description, organizer_id]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Error creating game:", error)
    res.status(500).json({ error: "Failed to create game" })
  }
}

// Update a game
export const updateGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      title,
      sport_type,
      location,
      scheduled_at,
      timezone,
      max_capacity,
      description
    }: UpdateGameInput = req.body

    // Build dynamic update query
    const updates: string[] = []
    const params: (string | number | null)[] = []
    let paramCount = 1

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`)
      params.push(title)
      paramCount++
    }

    if (sport_type !== undefined) {
      updates.push(`sport_type = $${paramCount}`)
      params.push(sport_type)
      paramCount++
    }

    if (location !== undefined) {
      updates.push(`location = $${paramCount}`)
      params.push(location)
      paramCount++
    }

    if (scheduled_at !== undefined && timezone !== undefined) {
      updates.push(`scheduled_at = $${paramCount} AT TIME ZONE $${paramCount + 1}`)
      params.push(scheduled_at, timezone)
      paramCount += 2
      updates.push(`timezone = $${paramCount}`)
      params.push(timezone)
      paramCount++
    } else if (scheduled_at !== undefined) {
      updates.push(`scheduled_at = $${paramCount}`)
      params.push(scheduled_at)
      paramCount++
    } else if (timezone !== undefined) {
      updates.push(`timezone = $${paramCount}`)
      params.push(timezone)
      paramCount++
    }

    if (max_capacity !== undefined) {
      updates.push(`max_capacity = $${paramCount}`)
      params.push(max_capacity)
      paramCount++
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`)
      params.push(description || null)
      paramCount++
    }

    if (updates.length === 0) {
      res.status(400).json({ error: "No fields to update" })
      return
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    params.push(id)

    const query = `UPDATE games SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`
    const result = await pool.query(query, params)

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Game not found" })
      return
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error("Error updating game:", error)
    res.status(500).json({ error: "Failed to update game" })
  }
}

// Delete a game
export const deleteGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Delete the game (RSVPs will be automatically deleted via ON DELETE CASCADE)
    const result = await pool.query("DELETE FROM games WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Game not found" })
      return
    }

    res.status(200).json({ message: "Game deleted successfully", game: result.rows[0] })
  } catch (error) {
    console.error("Error deleting game:", error)
    res.status(500).json({ error: "Failed to delete game" })
  }
}

export const getUserHostedGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    const result = await pool.query(
      `SELECT * FROM games
       WHERE organizer_id = $1
       AND scheduled_at > NOW()
       ORDER BY scheduled_at ASC`,
      [userId]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching user's hosted games:", error)
    res.status(500).json({ error: "Failed to fetch hosted games" })
  }
}

export const getUserRSVPGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    const result = await pool.query(
      `SELECT g.*, r.id as rsvp_id, r.status as rsvp_status
       FROM games g
       JOIN rsvps r ON g.id = r.game_id
       WHERE r.user_id = $1
       AND g.scheduled_at > NOW()
       ORDER BY g.scheduled_at ASC`,
      [userId]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching user's RSVP'd games:", error)
    res.status(500).json({ error: "Failed to fetch RSVP'd games" })
  }
}

export const getUserPastGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    const result = await pool.query(
      `SELECT g.*, r.id as rsvp_id, r.status as rsvp_status
       FROM games g
       JOIN rsvps r ON g.id = r.game_id
       WHERE r.user_id = $1
       AND g.scheduled_at <= NOW()
       ORDER BY g.scheduled_at DESC`,
      [userId]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching user's past games:", error)
    res.status(500).json({ error: "Failed to fetch past games" })
  }
}

export const getUserPastHostedGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    const result = await pool.query(
      `SELECT * FROM games
       WHERE organizer_id = $1
       AND scheduled_at <= NOW()
       ORDER BY scheduled_at DESC`,
      [userId]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching user's past hosted games:", error)
    res.status(500).json({ error: "Failed to fetch past hosted games" })
  }
}
