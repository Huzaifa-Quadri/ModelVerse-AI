import {
  generateChatMetadata,
  generateResponse,
} from "../services/ai.service.js";
import { AppError, catchAsync } from "../utils/errorHandler.js";
import chatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";
import { HTTP_STATUS } from "../config/constants.js";

export const startChat = catchAsync(async (req, res) => {
  const message = req.body.message;
  const currentUser = req.user.userId;
  // console.log("This is user", user, "and its userID : ", user.userId);

  const { title, topic } = await generateChatMetadata(message);

  const newChat = await chatModel.create({
    userId: currentUser,
    title: title,
    topic: topic,
  });

  const userMessage = await MessageModel.create({
    chatId: newChat._id,
    userId: currentUser,
    content: message,
    role: "user",
  });

  const allMessages = await MessageModel.find({ chatId: newChat._id });

  console.log("What actually comes in all Messages : \n\n\n", allMessages);

  const aiResponse = await generateResponse(allMessages);

  const aiMessage = await MessageModel.create({
    chatId: newChat._id,
    userId: currentUser,
    content: aiResponse,
    role: "assistant",
  });

  // console.log(`Message: ${message} & AI Title: ${title}`);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Created a new Chat and Generated AI response for the message.",
    data: {
      title: title,
      userMessage: userMessage,
      aiMessage: aiMessage,
    },
  });
});

export const continueChat = catchAsync(async (req, res) => {
  const { chatId } = req.params;
  const message = req.body.message;
  const currentUser = req.user.userId;

  const isChatExists = await chatModel.findOne({
    _id: chatId,
    userId: currentUser,
  });

  if (!isChatExists) {
    throw new AppError(
      "Chat not found, create a new Chat",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const userMessage = await MessageModel.create({
    chatId: chatId,
    userId: currentUser,
    content: message,
    role: "user",
  });

  const allMessages = await MessageModel.find({ chatId: chatId });

  const aiResponse = await generateResponse(allMessages);

  const aiMessage = await MessageModel.create({
    chatId: chatId,
    userId: currentUser,
    content: aiResponse,
    role: "assistant",
  });

  //Update lastActivity and messageCount in chat document
  await chatModel.findByIdAndUpdate(chatId, {
    $inc: { messageCount: 2 },
    lastActivity: Date.now(),
  });

  // console.log(`Message: ${message} & AI Reponse: ${aiResponse}`);
  console.log("All Message : \n\n\n", allMessages);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Generated AI response for the message :",
    data: {
      userMessage: userMessage,
      aiMessage: aiMessage,
    },
  });
});

export const getAllChats = catchAsync(async (req, res) => {
  const currentUser = req.user.userId;

  //checking if user has any chats or not
  const chats = await chatModel.find({ userId: currentUser });

  if (!chats) {
    throw new AppError("No chats found for the user.", HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Retrieved all chats for the user.",
    data: {
      chats: chats,
    },
  });
});

export const getMessages = catchAsync(async (req, res) => {
  const { chatId } = req.params;
  // Verify chat exists and belongs to the current user
  const chat = await chatModel.findById(chatId);

  if (!chat) {
    throw new AppError("Chat Id is Invalid", HTTP_STATUS.BAD_REQUEST);
  }

  if (String(chat.userId) !== String(req.user.userId)) {
    throw new AppError(
      "You are not allowed to view this chat",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  // Fetch messages for the chat (sorted by creation time)
  const messages = await MessageModel.find({ chatId: chatId }).sort({
    createdAt: 1,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Retrieved all messages for the chat.",
    data: {
      messages: messages,
    },
  });
});

export const deleteChat = catchAsync(async (req, res) => {
  const { chatId } = req.params;

  const chat = await chatModel.findById(chatId);
  if (!chat) {
    throw new AppError("Chat Id is Invalid", HTTP_STATUS.BAD_REQUEST);
  }

  if (String(chat.userId) !== String(req.user.userId)) {
    throw new AppError(
      "You are not allowed to perform this action",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  await chatModel.findByIdAndDelete(chatId);

  await MessageModel.deleteMany({ chatId: chatId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Chat and its messages deleted successfully",
  });
});
