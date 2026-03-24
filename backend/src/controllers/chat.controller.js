import { generateResponse, generateTitle } from "../services/ai.service.js"
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js"

export async function sendMessageController (req, res, next) {
    const { message, chatId } = req.body

    let title = null, chat = null;

    if (chatId) {
        chat = await chatModel.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        if (chat.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        }
    }

    if(!chatId){
        title = await generateTitle(message)
        chat = await chatModel.create({
            user: req.user.id,
            title: title
        })
    }
    
    const userMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: message,
        role: "user"
    })

    const messages = await messageModel.find({chat: chatId || chat._id}).sort({ createdAt: 1 }).lean()
    console.log("Messages:  ", messages)

    const result = await generateResponse(messages)

    const aiMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: result,
        role: "ai"
    })

    res.status(200).json({
        title,
        chat,
        aiMessage
    })
}

export async function getChatsController (req, res, next) {
    const user = req.user

    const chats = await chatModel.find({
        user: user.id
    })

    if(!chats || chats.length === 0){
        return res.status(404).json({
            message: "No chats found"
        })
    }

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function getMessagesController (req, res, next) {
    const user = req.user
    const { chatId } = req.params

    const chat = await chatModel.findOne({
        _id: chatId,
        user: user.id
    })

    if(!chat){
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    const messages = await messageModel.find({
        chat: chatId
    })

    res.status(200).json({
        message: "messages retrieved successfully",
        messages
    })
}

export async function deleteChatController (req, res, next) {
    const user = req.user
    const { chatId } = req.params

    const chat = await chatModel.findOne({
        _id: chatId,
        user: user.id
    })

    if(!chat){
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    await chat.deleteOne()

    await messageModel.deleteMany({
        chat: chatId
    })

    res.status(200).json({
        message: "chat deleted successfully"
    })
}