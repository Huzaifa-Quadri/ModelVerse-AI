import { generateResponse, generateTitle } from "../services/ai.service.js";
import { AppError, catchAsync } from "../utils/errorHandler.js";
import chatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";
import { HTTP_STATUS } from "../config/constants.js";

export const sendMessage = catchAsync(async (req, res) => {
  //Full logic
  const message = req.body.message;
  const currentUser = req.user.userId;
  // console.log("This is user", user, "and its userID : ", user.userId);

  const aiResponse = await generateResponse(message);
  const title = await generateTitle(message);

  const chat = await chatModel.create({
    userId: currentUser,
    title: title,
  });

  const messageDoc = await MessageModel.create({
    chatId: chat._id,
    userId: currentUser,
    content: aiResponse,
    role: "assistant",
  });

  console.log(`Message: ${message} & AI Title: ${title}`);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Message received & Here is AI Response",
    data: {
      title: title,
      // response: aiResponse,
      message: messageDoc,
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

  const aiResponse = await generateResponse(message);

  const messageDoc = await MessageModel.create({
    chatId: chatId,
    userId: currentUser,
    content: aiResponse,
    role: "assistant",
  });

  const allMessage = await MessageModel.find({ chatId: chatId });

  // console.log(`Message: ${message} & AI Reponse: ${aiResponse}`);
  console.log("All Message : \n\n\n", allMessage);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Generated AI response for the message :",
    data: {
      prompt: message,
      message: messageDoc,
    },
  });
});
