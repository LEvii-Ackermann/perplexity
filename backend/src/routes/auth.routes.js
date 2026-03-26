import express from "express"
import { getMeController, loginController, registerController, verifyEmailController, logoutController } from "../controllers/auth.controller.js"
import { loginValidator, registerValidator } from "../validators/auth.validator.js"
import { identifyUser } from "../middlewares/auth.middleware.js"

const authRouter = express.Router()

/**
 * @route POST /api/auth/register
 * @desc Register a user
 * @access Public
 * @body {username, email, password}
 */
authRouter.post("/register",registerValidator , registerController)

/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 */
authRouter.get("/verify-email", identifyUser, verifyEmailController)

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.post("/login",loginValidator ,loginController)

/**
 * @route GET /api/auth/get-me
 * @desc Get current logged in user details
 * @access Private
 */
authRouter.get("/get-me", identifyUser, getMeController)


authRouter.get("/logout", identifyUser, logoutController)

export default authRouter