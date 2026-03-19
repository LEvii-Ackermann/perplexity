import app from "./src/app.js"
import { connectToDB } from "./src/config/database.js"
import http from "http"
import { initSocket } from "./src/sockets/server.socket.js"

const httpServer = http.createServer(app)

initSocket(httpServer)

connectToDB()

httpServer.listen(3000, ()=> {
    console.log("the server is running at port 3000")
})