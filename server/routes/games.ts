import express from "express"

import {
  createGame,
  deleteGame,
  getGame,
  getGames,
  getUserHostedGames,
  getUserPastGames,
  getUserPastHostedGames,
  getUserRSVPGames,
  updateGame
} from "../controllers/games.js"

const router: express.Router = express.Router()

router.get("/", getGames)
router.get("/:id", getGame)
router.post("/", createGame)
router.patch("/:id", updateGame)
router.delete("/:id", deleteGame)

router.get("/user/:userId/hosted", getUserHostedGames)
router.get("/user/:userId/rsvps", getUserRSVPGames)
router.get("/user/:userId/past", getUserPastGames)
router.get("/user/:userId/past-hosted", getUserPastHostedGames)

export default router
