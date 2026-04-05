import { generateResponse, generateTitle } from "../services/ai.service.js";
import { AppError, catchAsync } from "../utils/errorHandler.js";
import chatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";
import { HTTP_STATUS } from "../config/constants.js";

export const sendMessage = catchAsync(async (req, res) => {
  const message = req.body.message;
  const currentUser = req.user.userId;
  // console.log("This is user", user, "and its userID : ", user.userId);

  const title = await generateTitle(message);

  const newChat = await chatModel.create({
    userId: currentUser,
    title: title,
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
