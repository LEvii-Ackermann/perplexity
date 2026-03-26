import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import redis from "../config/cache.js"

dotenv.config()

export async function identifyUser(req, res, next){
    const token = req.cookies.token || req.query.token

    if (!token) {
        return res.status(401).json({
            message: "Token not provided",
            success: false
        })
    }

    const isBlackListed = await redis.get(token)

    if(isBlackListed){
        return res.status(401).json({
            message: "This token is blacklisted"
        })
    }


    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({
            message: "Unauthorized access",
            success: false,
            err: "token invalid"
        })
    }
}