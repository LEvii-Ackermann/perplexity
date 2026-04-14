import {Server} from "socket.io"

let io;

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
    process.env.BASE_URL
].filter(Boolean)

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    })

    console.log("Socket.io server is RUNNING")

    io.on("connection", (socket) => {
        console.log("New client connected: " + socket.id)
    })
}

export function getIo() {
    if (!io) {
        throw new Error("Socket.io is not initialized.")
    }

    return io;
}