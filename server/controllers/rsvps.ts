import { isPast, parseISO } from "date-fns"
import { Request, Response } from "express"

import { pool } from "../config/database"
import { type CreateRSVPInput, type UpdateRSVPInput } from "../types"

// Get all RSVPs for a game
export const getRSVPsForGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params
    // join with users table to get user details as well
    const result = await pool.query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM rsvps r
       JOIN users u ON r.user_id = u.id
       WHERE r.game_id = $1
       ORDER BY r.created_at ASC`,
      [gameId]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching RSVPs:", error)
    res.status(500).json({ error: "Failed to fetch RSVPs" })
  }
}

// Create a new RSVP
export const createRSVP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params
    // expects user id from above instead
    const { user_id }: CreateRSVPInput = req.body

    // Validate required fields
    if (!user_id) {
      res.status(400).json({ error: "User ID is required" })
      return
    }

    // validation - check if user exists in database
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [user_id])
    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" })
      return
    }

    // Check if game exists and is not full
    const gameResult = await pool.query("SELECT * FROM games WHERE id = $1", [gameId])

    if (gameResult.rows.length === 0) {
      res.status(404).json({ error: "Game not found" })
      return
    }

    const game = gameResult.rows[0]

    // Check if game is full
    if (game.current_capacity >= game.max_capacity) {
      res.status(400).json({ error: "Game is full" })
      return
    }

    // Check if game is in the past
    const scheduledAt = parseISO(game.scheduled_at)

    if (isPast(scheduledAt)) {
      const formattedDate = scheduledAt.toLocaleDateString("en-US")
      const formattedTime = scheduledAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      })
      res.status(400).json({
        error: `This game was scheduled for ${formattedDate} at ${formattedTime} and has already begun or passed.`
      })
      return
    }

    // validation - prevent duplicate RSVPs
    const existingRSVP = await pool.query(
      "SELECT * FROM rsvps WHERE game_id = $1 AND user_id = $2",
      [gameId, user_id]
    )

    if (existingRSVP.rows.length > 0) {
      res.status(400).json({ error: "User already RSVP'd to this game" })
      return
    }

    // Use transaction to ensure RSVP creation and capacity update happen atomically
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Create RSVP
      const rsvpResult = await client.query(
        `INSERT INTO rsvps (game_id, user_id, status)
         VALUES ($1, $2, 'confirmed')
         RETURNING *`,
        [gameId, user_id]
      )

      // Update game current_capacity
      await client.query("UPDATE games SET current_capacity = current_capacity + 1 WHERE id = $1", [
        gameId
      ])

      await client.query("COMMIT")
      res.status(201).json(rsvpResult.rows[0])
    } catch (txError) {
      await client.query("ROLLBACK")
      throw txError
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error creating RSVP:", error)
    res.status(500).json({ error: "Failed to create RSVP" })
  }
}

// Update RSVP status
export const updateRSVP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status }: UpdateRSVPInput = req.body

    // Validate status
    if (!status || !["confirmed", "waitlisted", "rejected"].includes(status)) {
      res.status(400).json({ error: "Invalid status" })
      return
    }

    const result = await pool.query(
      `UPDATE rsvps SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "RSVP not found" })
      return
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error("Error updating RSVP:", error)
    res.status(500).json({ error: "Failed to update RSVP" })
  }
}

// Delete/Cancel RSVP
export const deleteRSVP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Get RSVP details before deleting
    const rsvpResult = await pool.query("SELECT * FROM rsvps WHERE id = $1", [id])

    if (rsvpResult.rows.length === 0) {
      res.status(404).json({ error: "RSVP not found" })
      return
    }

    const rsvp = rsvpResult.rows[0]

    // Delete RSVP
    await pool.query("DELETE FROM rsvps WHERE id = $1", [id])

    // Update game current_capacity if RSVP was confirmed
    if (rsvp.status === "confirmed") {
      await pool.query(
        "UPDATE games SET current_capacity = GREATEST(0, current_capacity - 1) WHERE id = $1",
        [rsvp.game_id]
      )
    }

    res.status(200).json({ message: "RSVP cancelled successfully", rsvp })
  } catch (error) {
    console.error("Error deleting RSVP:", error)
    res.status(500).json({ error: "Failed to delete RSVP" })
  }
}
