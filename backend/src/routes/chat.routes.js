import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  continueChat,
  deleteChat,
  getAllChats,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller.js";
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

/**
 * @route - GET api/chats/
 * @description - Gets all chats that the singed in User created
 * @access - private
 */
chatRouter.get("/", verifyToken, getAllChats);

/**
 * @route - GET api/:chatId/messages
 * @description - Gets all messages a user has in the particular chat
 * @access - private
 */
chatRouter.get("/:chatId/messages", verifyToken, getMessages);

/**
 * @route - DELETE api/chats/:chatId
 * @description - Delete the demanded chat and its associated messages
 * @access - private
 */
chatRouter.delete("/:chatId", verifyToken, deleteChat);

export default chatRouter;
