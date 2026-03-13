import express from "express"
import { registerController } from "../controllers/auth.controller.js"
import { registerValidator } from "../middlewares/auth.validator.js"

const authRouter = express.Router()

/**
 * @route POST /api/auth/register
 * @desc Register a user
 * @access Public
 * @body {username, email, password}
 */
authRouter.post("/register",registerValidator, registerController)

export default authRouter