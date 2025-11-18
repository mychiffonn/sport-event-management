import { isPast } from "date-fns"
import { Request, Response } from "express"

import pool from "../config/database.js"
import { type CreateRSVPInput, type UpdateRSVPInput } from "../types.js"

// Get all RSVPs for a game
export const getRSVPsForGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params
    // join with users table to get user details as well
    const result = await pool.query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM rsvps r
       JOIN "user" u ON r.user_id = u.id
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
    const userResult = await pool.query('SELECT * FROM "user" WHERE id = $1', [user_id])
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
    const scheduledAt = new Date(game.scheduled_at)

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
         VALUES ($1, $2, 'going')
         RETURNING *`,
        [gameId, user_id]
      )

      // Update game current_capacity
      await client.query("UPDATE games SET current_capacity = current_capacity + 1 WHERE id = $1", [
        gameId
      ])

      // Fetch the RSVP with user details before committing
      const rsvpWithUser = await client.query(
        `SELECT r.*, u.name as user_name, u.email as user_email
         FROM rsvps r
         JOIN "user" u ON r.user_id = u.id
         WHERE r.id = $1`,
        [rsvpResult.rows[0].id]
      )

      await client.query("COMMIT")

      res.status(201).json(rsvpWithUser.rows[0])
    } catch (txError) {
      await client.query("ROLLBACK")
      throw txError
    } finally {
      client.release()
    }
  } catch {
    res.status(500).json({ error: "Failed to create RSVP" })
  }
}

// Update RSVP status
export const updateRSVP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status }: UpdateRSVPInput = req.body

    // Validate status
    if (!status || !["going", "maybe", "not_going"].includes(status)) {
      res.status(400).json({ error: "Invalid status" })
      return
    }

    // Get current RSVP to check old status
    const currentRSVP = await pool.query("SELECT * FROM rsvps WHERE id = $1", [id])

    if (currentRSVP.rows.length === 0) {
      res.status(404).json({ error: "RSVP not found" })
      return
    }

    const oldStatus = currentRSVP.rows[0].status
    const gameId = currentRSVP.rows[0].game_id

    // Check if game is in the past
    const gameResult = await pool.query("SELECT * FROM games WHERE id = $1", [gameId])
    if (gameResult.rows.length === 0) {
      res.status(404).json({ error: "Game not found" })
      return
    }

    const game = gameResult.rows[0]
    const scheduledAt = new Date(game.scheduled_at)

    if (isPast(scheduledAt)) {
      const formattedDate = scheduledAt.toLocaleDateString("en-US")
      const formattedTime = scheduledAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      })
      res.status(400).json({
        error: `Cannot modify RSVP for a past event. This game was scheduled for ${formattedDate} at ${formattedTime}.`
      })
      return
    }

    // If status hasn't changed, just return the current RSVP
    if (oldStatus === status) {
      res.status(200).json(currentRSVP.rows[0])
      return
    }

    // Use transaction to ensure RSVP update and capacity change happen atomically
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Check if we need to update capacity
      const oldIsGoing = oldStatus === "going"
      const newIsGoing = status === "going"

      // If changing to 'going', check if game has capacity
      if (!oldIsGoing && newIsGoing) {
        if (game.current_capacity >= game.max_capacity) {
          await client.query("ROLLBACK")
          res.status(400).json({ error: "Game is full" })
          return
        }

        // Increment capacity
        await client.query(
          "UPDATE games SET current_capacity = current_capacity + 1 WHERE id = $1",
          [gameId]
        )
      } else if (oldIsGoing && !newIsGoing) {
        // Decrement capacity
        await client.query(
          "UPDATE games SET current_capacity = GREATEST(0, current_capacity - 1) WHERE id = $1",
          [gameId]
        )
      }

      // Update RSVP status
      await client.query(
        `UPDATE rsvps SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, id]
      )

      // Fetch the RSVP with user details before committing
      const rsvpWithUser = await client.query(
        `SELECT r.*, u.name as user_name, u.email as user_email
         FROM rsvps r
         JOIN "user" u ON r.user_id = u.id
         WHERE r.id = $1`,
        [id]
      )

      await client.query("COMMIT")

      res.status(200).json(rsvpWithUser.rows[0])
    } catch (txError) {
      await client.query("ROLLBACK")
      throw txError
    } finally {
      client.release()
    }
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

    // Check if game is in the past
    const gameResult = await pool.query("SELECT * FROM games WHERE id = $1", [rsvp.game_id])
    if (gameResult.rows.length === 0) {
      res.status(404).json({ error: "Game not found" })
      return
    }

    const game = gameResult.rows[0]
    const scheduledAt = new Date(game.scheduled_at)

    if (isPast(scheduledAt)) {
      const formattedDate = scheduledAt.toLocaleDateString("en-US")
      const formattedTime = scheduledAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
      })
      res.status(400).json({
        error: `Cannot cancel RSVP for a past event. This game was scheduled for ${formattedDate} at ${formattedTime}.`
      })
      return
    }

    // Delete RSVP
    await pool.query("DELETE FROM rsvps WHERE id = $1", [id])

    // Update game current_capacity if RSVP was going
    if (rsvp.status === "going") {
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
