import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { sendEmail } from "../services/mail.service.js"

export async function registerController (req, res, next) {
    const { username, email, password } = req.body

    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            {
                username: username
            },
            {
                email: email
            }
        ]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "User with this email or username already exist",
            success: false,
            err: "User already exists"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({ 
        email: email,
        username: username,
        password: hash
    })

    await sendEmail({
        to: email,
        subject: "Welcome to Perplexity.",
        html: `
            <p>Hi ${username},</p>
            <p>Thank you for registering at <strong>Perplixity</strong>. We are excity to have you on our platform.</p>
            <p>Best regards, <br>The Perplexity Team</p>
        `
    })

    res.status(201).json({
        message: "user registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}