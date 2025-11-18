import express from "express"

import {
  getUserById,
  getUserHostedGames,
  getUserPastGames,
  getUserPastHostedGames,
  getUserRSVPGames
} from "../controllers/users.js"

const router: express.Router = express.Router()

router.get("/:userId", getUserById)
router.get("/:userId/hosted", getUserHostedGames)
router.get("/:userId/rsvps", getUserRSVPGames)
router.get("/:userId/past", getUserPastGames)
router.get("/:userId/past-hosted", getUserPastHostedGames)

export default router
