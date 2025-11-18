import { Request, Response } from "express"

import pool from "../config/database.js"

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    const result = await pool.query(`SELECT id, name, email, created_at FROM users WHERE id = $1`, [
      userId
    ])

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" })
      return
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ error: "Failed to fetch user" })
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
