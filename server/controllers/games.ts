import { Request, Response } from 'express'
import { pool } from '../config/database.js'
import type { CreateGameInput, UpdateGameInput, GameFilters } from '../types/types.js'

// Get all games with optional filters
export const getGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sport_type, location, date, has_spots } = req.query as GameFilters

    let query = 'SELECT * FROM games WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

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

    if (date) {
      query += ` AND date = $${paramCount}`
      params.push(date)
      paramCount++
    }

    if (has_spots === 'true' || has_spots === true) {
      query += ' AND current_capacity < max_capacity'
    }

    query += ' ORDER BY date ASC, time ASC'

    const result = await pool.query(query, params)
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching games:', error)
    res.status(500).json({ error: 'Failed to fetch games' })
  }
}

// Get a single game by ID
export const getGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM games WHERE id = $1', [id])

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Game not found' })
      return
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error fetching game:', error)
    res.status(500).json({ error: 'Failed to fetch game' })
  }
}

// Create a new game
export const createGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, sport_type, location, date, time, max_capacity, description, organizer_id }: CreateGameInput = req.body

    // Validate required fields
    if (!title || !sport_type || !location || !date || !time || !max_capacity) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    // Validate date is in the future
    const gameDate = new Date(`${date}T${time}`)
    if (gameDate <= new Date()) {
      res.status(400).json({ error: 'Game date must be in the future' })
      return
    }

    const result = await pool.query(
      `INSERT INTO games (title, sport_type, location, date, time, max_capacity, current_capacity, description, organizer_id)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8)
       RETURNING *`,
      [title, sport_type, location, date, time, max_capacity, description, organizer_id]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating game:', error)
    res.status(500).json({ error: 'Failed to create game' })
  }
}

// Update a game
export const updateGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { title, sport_type, location, date, time, max_capacity, description }: UpdateGameInput = req.body

    // Build dynamic update query
    const updates: string[] = []
    const params: any[] = []
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

    if (date !== undefined) {
      updates.push(`date = $${paramCount}`)
      params.push(date)
      paramCount++
    }

    if (time !== undefined) {
      updates.push(`time = $${paramCount}`)
      params.push(time)
      paramCount++
    }

    if (max_capacity !== undefined) {
      updates.push(`max_capacity = $${paramCount}`)
      params.push(max_capacity)
      paramCount++
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`)
      params.push(description)
      paramCount++
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' })
      return
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    params.push(id)

    const query = `UPDATE games SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`
    const result = await pool.query(query, params)

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Game not found' })
      return
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating game:', error)
    res.status(500).json({ error: 'Failed to update game' })
  }
}

// Delete a game
export const deleteGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // First delete all RSVPs for this game
    await pool.query('DELETE FROM rsvps WHERE game_id = $1', [id])

    // Then delete the game
    const result = await pool.query('DELETE FROM games WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Game not found' })
      return
    }

    res.status(200).json({ message: 'Game deleted successfully', game: result.rows[0] })
  } catch (error) {
    console.error('Error deleting game:', error)
    res.status(500).json({ error: 'Failed to delete game' })
  }
}
