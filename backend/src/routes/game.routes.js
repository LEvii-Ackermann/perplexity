import express from "express"
import { identifyUser } from "../middlewares/auth.middleware.js"   
import { sendMessage, startGame, leaderboardController, scoreController, getUserRankController } from "../controllers/game.controller.js"

const gameRouter = express.Router()

gameRouter.post("/start", identifyUser, startGame)

gameRouter.post("/message", identifyUser, sendMessage)

gameRouter.get("/leaderboard", identifyUser, leaderboardController)

gameRouter.get("/score", identifyUser, scoreController)

gameRouter.get("/userRank", identifyUser, getUserRankController)


export default gameRouter