import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import morgan from "morgan"
import passport from "passport"
import { Strategy as GoogleStrategy} from "passport-google-oauth20"

import authRouter from "./routes/auth.routes.js"
import chatRouter from "./routes/chat.routes.js"
import gameRouter from "./routes/game.routes.js"

const app = express()
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(cookieParser())
app.use(morgan("dev"))
app.use(passport.initialize())

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID_OATH,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_OATH,
    callbackURL: "http://localhost:3000/api/auth/google/callback"
}, (_,__, profile, done) => {
    return done(null, profile)
}))


app.use("/api/auth", authRouter)
app.use("/api/chats", chatRouter)
app.use("/api/game", gameRouter)

export default app