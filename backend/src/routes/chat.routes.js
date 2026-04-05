import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { continueChat, sendMessage } from "../controllers/chat.controller.js";
const chatRouter = Router();

/**
 * @route - POST api/chats/
 * @description - Creating a new chat Sending a new message to the chatbot and receive a response
 * @access - private
 */
chatRouter.post("/message", verifyToken, sendMessage);

/**
 * @route - POST api/:chatId/message
 * @description - Continuing conversation with new messages in existing chat
 * @access - private
 */
chatRouter.post("/:chatId/messages", verifyToken, continueChat);

export default chatRouter;
