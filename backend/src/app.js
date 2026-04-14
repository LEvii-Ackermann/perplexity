import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import morgan from "morgan"
import passport from "passport"
import { Strategy as GoogleStrategy} from "passport-google-oauth20"
import path from "path"
import { fileURLToPath } from "url"

import authRouter from "./routes/auth.routes.js"
import chatRouter from "./routes/chat.routes.js"
import gameRouter from "./routes/game.routes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
app.use(express.json())
app.use(cors({
    origin: [
        "http://localhost:5173",
        process.env.BASE_URL
    ],
    credentials: true
}))
app.use(cookieParser())
app.use(morgan("dev"))
app.use(passport.initialize())

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID_OATH,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_OATH,
    callbackURL: "${process.env.BASE_URL}/api/auth/google/callback"
}, (_,__, profile, done) => {
    return done(null, profile)
}))


app.use("/api/auth", authRouter)
app.use("/api/chats", chatRouter)
app.use("/api/game", gameRouter)

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Catch-all route (for React Router)
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

export default app