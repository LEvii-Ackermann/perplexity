import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import morgan from "morgan"

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

app.use("/api/auth", authRouter)
app.use("/api/chats", chatRouter)
app.use("/api/game", gameRouter)

export default app