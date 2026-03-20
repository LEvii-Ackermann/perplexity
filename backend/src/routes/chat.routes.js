import express from 'express';
import { deleteChatController, getChatsController, getMessagesController, sendMessageController } from '../controllers/chat.controller.js';
import { identifyUser } from '../middlewares/auth.middleware.js';

const chatRouter = express.Router();

chatRouter.post('/message', identifyUser, sendMessageController)

chatRouter.get("/", identifyUser, getChatsController)

chatRouter.get("/:chatId/messages", identifyUser, getMessagesController)  

chatRouter.get("/:chatId/delete", identifyUser, deleteChatController)


export default chatRouter