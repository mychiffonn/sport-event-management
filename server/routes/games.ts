import express from 'express'
import {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
} from '../controllers/games.js'

const router = express.Router()

// Games routes
router.get('/', getGames)
router.get('/:id', getGame)
router.post('/', createGame)
router.patch('/:id', updateGame)
router.delete('/:id', deleteGame)

export default router
