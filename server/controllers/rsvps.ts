import { Request, Response } from 'express'
import { pool } from '../config/database.js'
import type { CreateRSVPInput, UpdateRSVPInput } from '../types/types.js'

// Get all RSVPs for a game
export const getRSVPsForGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params

    const result = await pool.query(
      'SELECT * FROM rsvps WHERE game_id = $1 ORDER BY created_at ASC',
      [gameId]
    )

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching RSVPs:', error)
    res.status(500).json({ error: 'Failed to fetch RSVPs' })
  }
}

// Create a new RSVP
export const createRSVP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params
    const { user_name, user_email }: CreateRSVPInput = req.body

    // Validate required fields
    if (!user_name) {
      res.status(400).json({ error: 'User name is required' })
      return
    }

    // Check if game exists and is not full
    const gameResult = await pool.query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    )

    if (gameResult.rows.length === 0) {
      res.status(404).json({ error: 'Game not found' })
      return
    }

    const game = gameResult.rows[0]

    // Check if game is full
    if (game.current_capacity >= game.max_capacity) {
      res.status(400).json({ error: 'Game is full' })
      return
    }

    // Check if game date is in the future
    const gameDate = new Date(`${game.date}T${game.time}`)
    if (gameDate <= new Date()) {
      res.status(400).json({ error: 'Cannot RSVP to a past game' })
      return
    }

    // Create RSVP
    const rsvpResult = await pool.query(
      `INSERT INTO rsvps (game_id, user_name, user_email, status)
       VALUES ($1, $2, $3, 'confirmed')
       RETURNING *`,
      [gameId, user_name, user_email]
    )

    // Update game current_capacity
    await pool.query(
      'UPDATE games SET current_capacity = current_capacity + 1 WHERE id = $1',
      [gameId]
    )

    res.status(201).json(rsvpResult.rows[0])
  } catch (error) {
    console.error('Error creating RSVP:', error)
    res.status(500).json({ error: 'Failed to create RSVP' })
  }
}

// Update RSVP status
export const updateRSVP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status }: UpdateRSVPInput = req.body

    // Validate status
    if (!status || !['confirmed', 'waitlisted', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' })
      return
    }

    const result = await pool.query(
      `UPDATE rsvps SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'RSVP not found' })
      return
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating RSVP:', error)
    res.status(500).json({ error: 'Failed to update RSVP' })
  }
}

// Delete/Cancel RSVP
export const deleteRSVP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Get RSVP details before deleting
    const rsvpResult = await pool.query('SELECT * FROM rsvps WHERE id = $1', [id])

    if (rsvpResult.rows.length === 0) {
      res.status(404).json({ error: 'RSVP not found' })
      return
    }

    const rsvp = rsvpResult.rows[0]

    // Delete RSVP
    await pool.query('DELETE FROM rsvps WHERE id = $1', [id])

    // Update game current_capacity if RSVP was confirmed
    if (rsvp.status === 'confirmed') {
      await pool.query(
        'UPDATE games SET current_capacity = GREATEST(0, current_capacity - 1) WHERE id = $1',
        [rsvp.game_id]
      )
    }

    res.status(200).json({ message: 'RSVP cancelled successfully', rsvp })
  } catch (error) {
    console.error('Error deleting RSVP:', error)
    res.status(500).json({ error: 'Failed to delete RSVP' })
  }
}
