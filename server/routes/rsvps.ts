import express from 'express'
import {
  getRSVPsForGame,
  createRSVP,
  updateRSVP,
  deleteRSVP,
} from '../controllers/rsvps.js'

const router = express.Router()

// RSVP routes
router.get('/games/:gameId/rsvps', getRSVPsForGame)
router.post('/games/:gameId/rsvps', createRSVP)
router.patch('/rsvps/:id', updateRSVP)
router.delete('/rsvps/:id', deleteRSVP)

export default router
