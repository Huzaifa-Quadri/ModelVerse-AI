import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Chat title is required"],
      trim: true,
      default: "Untitled Chat",
    },
    description: {
      type: String,
      default: "",
    },
    topic: {
      type: String,
      enum: ["general", "search", "technical", "creative", "other"],
      default: "general",
    },
    messageCount: {
      type: Number,
      default: 2,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
chatSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Chat", chatSchema);
