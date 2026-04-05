import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      default: "user",
    },
    // metadata: {
    //   type: mongoose.Schema.Types.Mixed,
    //   default: {},
    // },
  },
  {
    timestamps: true,
  },
);

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
