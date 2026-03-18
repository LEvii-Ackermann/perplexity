import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    }
})

transporter.verify((error, success) => {
    if(error){
        console.error('Error connecting to email server', error)
    }
    else{
        console.log('Email is ready to send messages')
    }
})

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `Naved Hasan <${process.env.GOOGLE_USER}>`,
            to,
            subject,
            text,
            html
        })

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email', error)
    }
}