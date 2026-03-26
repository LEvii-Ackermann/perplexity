import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { sendEmail } from "../services/mail.service.js"
import dotenv from "dotenv"
import redis from "../config/cache.js"

dotenv.config() 

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

    const emailVerificationToken = jwt.sign({
        email: user.email,
        username: user.username,
        id: user._id
    }, process.env.JWT_SECRET)

    await sendEmail({
        to: email,
        subject: "Welcome to Perplexity.",
        html: `
            <p>Hi ${username},</p>
            <p>Thank you for registering at <strong>Perplixity</strong>. We are excited to have you on our platform.</p>
            <p>To verify your email address, please click the link below:</p>
            <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
            <p>If you did not create an account, please ignore this email.</p>
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

export async function verifyEmailController(req, res, next){
    const email = req.user.email

    const user = await userModel.findOne({
        email: email
    })

    if(!user){
        return res.status(400).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    user.verified = true
    await user.save()

    const html = `
        <p>Hi ${user.username},</p>
        <p>Your email has been successfully verified. You can now log in to your account and start using our services.</p>
        <a href="http://localhost:3000/login">Login to Perplexity</a>
        <p>Best regards, <br>The Perplexity Team</p>
    `

    res.send(html)
}

export async function loginController(req, res, next){
    const { email,username ,password } = req.body

    const user = await userModel.findOne({
        $or: [
            { email },
            { username }
        ]
    }).select("+password")

    if(!user){
        return res.status(400).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    console.log("Password from body:", password)
    console.log("Password from DB:", user.password)

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid){
        return res.status(400).json({
            message: "Invalid password",
            success: false,
            err: "Invalid password"
        })
    }

    if(!user.verified){
        return res.status(400).json({
            message: "Email not verified",
            success: false,
            err: "Email not verified"
        })
    }

    const token = jwt.sign({
        id: user._id,
        email: user.email,
        username: user.username
    }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("token", token)

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email   
        }  
    })    
}

export async function getMeController(req, res, next){
    const userId = req.user.id

    const user = await userModel.findById(userId).select("-password")

    if(!user){
        return res.status(400).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User found",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

export async function logoutController(req, res, next){
    const token = req.cookies.token

    res.clearCookie("token")
    await redis.set(token, Date.now().toString())

    res.status(200).json({
        message: "logout user successfully"
    })
}