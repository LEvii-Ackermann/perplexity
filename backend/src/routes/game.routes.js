import express from "express"
import { identifyUser } from "../middlewares/auth.middleware.js"   
import { sendMessage, startGame } from "../controllers/game.controller.js"

const gameRouter = express.Router()

gameRouter.post("/start", identifyUser, startGame)

gameRouter.post("/message", identifyUser, sendMessage)


export default gameRouter