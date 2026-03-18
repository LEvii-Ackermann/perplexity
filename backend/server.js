import app from "./src/app.js"
import { connectToDB } from "./src/config/database.js"

connectToDB()

app.listen(3000, ()=> {
    console.log("the server is running at port 3000")
})