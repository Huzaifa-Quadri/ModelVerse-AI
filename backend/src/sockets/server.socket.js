import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import chatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";
import {
  generateChatMetadata,
  generateStreamingResponse,
} from "../services/ai.service.js";

let io;

// When a user clicks "Stop Generating", we need to cancel the AI stream.
// We map each socket.id → AbortController so we can abort() on demand.
//
// Why a Map?
//   - Each connected user (socket) can only have ONE active generation at a time
//   - When they start a new generation, we store the controller
//   - When they cancel or disconnect, we abort and clean up
const activeStreams = new Map();

// ============================================
// Socket Authentication Middleware
// ============================================
//
// Problem: Socket.IO connections don't go through Express middleware,
// so our verifyToken middleware from auth.middleware.js doesn't run.
//
// Solution: Socket.IO has its own middleware system via io.use().
// During the WebSocket handshake, the client sends cookies along with
// the connection request. We extract the JWT from those cookies,
// verify it, and attach the decoded user data to socket.user.
//
// This runs ONCE per connection (not per event), so the user is
// authenticated for the entire lifetime of their socket connection.
//
// Flow:
//   1. Client connects → Socket.IO triggers handshake
//   2. This middleware reads cookies from handshake headers
//   3. Finds the "token" cookie (same one Express sets on login)
//   4. Verifies JWT → attaches socket.user = { userId, ... }
//   5. Calls next() → connection proceeds
//   6. If invalid → calls next(Error) → connection rejected
//
function authenticateSocket(socket, next) {
  try {
    // ── Extract cookies from the handshake headers ──
    // Socket.IO handshake is an HTTP request, so cookies come in
    // the "cookie" header as a semicolon-separated string:
    // "token=eyJhbGc...; otherCookie=value"
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Authentication error: No cookies found"));
    }

    // ── Parse the cookie string to find our JWT ──
    // Split "token=abc123; other=xyz" into individual cookies,
    // then find the one named "token"
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});

    const token = cookies.token;

    if (!token) {
      return next(new Error("Authentication error: No token found"));
    }

    // ── Verify the JWT (same secret as Express auth middleware) ──
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Attach user data to the socket object ──
    // Now every event handler can access socket.user.userId
    // This is identical to how req.user works in Express routes
    socket.user = decoded;

    console.log(`🔐 Socket authenticated: user ${decoded.userId}`);
    next(); // ✅ Allow connection
  } catch (error) {
    console.error("❌ Socket auth failed:", error.message);
    next(new Error("Authentication error: Invalid token"));
  }
}

// ============================================
// Initialize Socket.IO Server
// ============================================
//
// Called once from server.js during startup.
// Sets up:
//   1. Socket.IO server with CORS config
//   2. Authentication middleware
//   3. Connection handler with all chat events
//
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "development"
          ? `http://localhost:${process.env.Frontend_PORT}`
          : process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true, // IMPORTANT: allows cookies to be sent with the connection
    },
  });

  console.log("⚙️  Socket IO Server is Running....");

  // ── Register auth middleware ──
  // io.use() runs BEFORE any "connection" event fires.
  // If authenticateSocket calls next(Error), the connection is rejected
  // and the client receives a "connect_error" event.
  io.use(authenticateSocket);

  // ============================================
  // Connection Handler
  // ============================================
  // Fires when a client successfully connects (after auth passes).
  // Each connected client gets a unique `socket` object.
  // We register all our chat event listeners on this socket.
  io.on("connection", (socket) => {
    console.log(
      `✅ User connected: ${socket.user.userId} (socket: ${socket.id})`,
    );

    // ──────────────────────────────────────────────────────────────────
    // EVENT: chat:sendMessage
    // ──────────────────────────────────────────────────────────────────
    //
    // This is the MAIN event — replaces REST POST /api/chats/messages
    // and POST /api/chats/:chatId/messages.
    //
    // The client emits:
    //   socket.emit("chat:sendMessage", { chatId: "abc" | null, message: "Hello" })
    //
    // What happens:
    //   1. If chatId is null → create a new chat (like REST startChat)
    //   2. Save the user's message to MongoDB
    //   3. Emit "chat:userMessageSaved" so frontend can display it immediately
    //   4. Start streaming AI response token-by-token
    //   5. Each token → emit "ai:token" to the client
    //   6. When done → save complete AI message to DB → emit "ai:complete"
    //
    // Why this is better than REST:
    //   - REST: client waits 2-10 seconds, gets entire response at once
    //   - Socket: client sees first token in ~200ms, words flow continuously
    //
    socket.on("chat:sendMessage", async ({ chatId, message }) => {
      // ── Input validation ──
      if (!message || !message.trim()) {
        socket.emit("chat:error", { message: "Message cannot be empty" });
        return;
      }

      const userId = socket.user.userId;

      try {
        let currentChatId = chatId;
        let isNewChat = false;

        // ══════════════════════════════════════════════════════════════
        // CASE A: No chatId → Create a brand new chat
        // ══════════════════════════════════════════════════════════════
        // This mirrors the logic in chat.controller.js → startChat()
        if (!currentChatId) {
          isNewChat = true;

          // Generate a catchy title + topic using Mistral AI
          // e.g., message "what is JavaScript?" → title: "JavaScript 101", topic: "technical"
          const { title, topic } = await generateChatMetadata(message);

          // Create the chat document in MongoDB
          const newChat = await chatModel.create({
            userId,
            title,
            topic,
          });

          currentChatId = newChat._id;

          // ── Tell the client about the new chat ──
          // The frontend needs this to:
          //   1. Add the chat to the sidebar
          //   2. Set it as the current active chat
          //   3. Know the chatId for future messages
          socket.emit("chat:created", {
            chatId: currentChatId.toString(),
            title,
          });
        }

        // ══════════════════════════════════════════════════════════════
        // STEP 1: Save the user's message to MongoDB
        // ══════════════════════════════════════════════════════════════
        const userMessage = await MessageModel.create({
          chatId: currentChatId,
          userId,
          content: message,
          role: "user",
        });

        // ── Tell the client the user message was saved ──
        // Frontend uses this to display the message with the real MongoDB _id
        // (replacing the optimistic/pending message it showed immediately)
        socket.emit("chat:userMessageSaved", {
          chatId: currentChatId.toString(),
          userMessage: {
            _id: userMessage._id,
            chatId: currentChatId.toString(),
            content: userMessage.content,
            role: userMessage.role,
            createdAt: userMessage.createdAt,
          },
          isNewChat,
        });

        // ══════════════════════════════════════════════════════════════
        // STEP 2: Fetch conversation history for AI context
        // ══════════════════════════════════════════════════════════════
        // The AI needs ALL previous messages in this chat to maintain
        // conversation context (it doesn't remember past messages on its own)
        const allMessages = await MessageModel.find({
          chatId: currentChatId,
        });

        // ══════════════════════════════════════════════════════════════
        // STEP 3: Create AbortController for cancellation support
        // ══════════════════════════════════════════════════════════════
        // If the user clicks "Stop Generating", we call controller.abort()
        // which sets signal.aborted = true inside generateStreamingResponse
        const abortController = new AbortController();
        activeStreams.set(socket.id, abortController);

        // ── Tell client that streaming is about to start ──
        socket.emit("ai:streamStart", {
          chatId: currentChatId.toString(),
        });

        // ══════════════════════════════════════════════════════════════
        // STEP 4: Stream AI response token-by-token
        // ══════════════════════════════════════════════════════════════
        //
        // generateStreamingResponse calls our onToken callback for each token.
        // Inside the callback, we immediately emit that token to the client.
        //
        // Timeline example:
        //   t=200ms  → onToken("Hello")    → socket.emit("ai:token", "Hello")
        //   t=250ms  → onToken(" there")   → socket.emit("ai:token", " there")
        //   t=300ms  → onToken("! How")    → socket.emit("ai:token", "! How")
        //   ... and so on until the AI finishes
        //
        const fullAiContent = await generateStreamingResponse(
          allMessages,
          (token) => {
            // This callback fires for EACH token from Gemini
            // We emit it to the client immediately — no batching, no waiting
            socket.emit("ai:token", {
              chatId: currentChatId.toString(),
              token, // e.g., "Hello" or " world" or "!" — each a small piece
            });
          },
          abortController.signal, // Pass the signal so we can cancel
        );

        // ── Clean up the AbortController ──
        activeStreams.delete(socket.id);

        // ══════════════════════════════════════════════════════════════
        // STEP 5: Save the complete AI response to MongoDB
        // ══════════════════════════════════════════════════════════════
        // fullAiContent is all the tokens joined together.
        // We save it as a single message document, just like the REST version does.
        // If the user cancelled, fullAiContent might be partial — we still save it.
        if (fullAiContent) {
          const aiMessage = await MessageModel.create({
            chatId: currentChatId,
            userId,
            content: fullAiContent,
            role: "assistant",
          });

          // Update the chat document's activity timestamp and message count
          await chatModel.findByIdAndUpdate(currentChatId, {
            $inc: { messageCount: 2 }, // +1 user message, +1 AI message
            lastActivity: Date.now(),
          });

          // ── Tell client streaming is complete ──
          // Frontend uses this to:
          //   1. Replace the streaming bubble with the final saved message
          //   2. Clear the streaming state
          //   3. Re-enable the input box
          socket.emit("ai:complete", {
            chatId: currentChatId.toString(),
            aiMessage: {
              _id: aiMessage._id,
              chatId: currentChatId.toString(),
              content: aiMessage.content,
              role: aiMessage.role,
              createdAt: aiMessage.createdAt,
            },
          });
        } else {
          // AI returned empty (probably cancelled) — still signal completion
          socket.emit("ai:complete", {
            chatId: currentChatId.toString(),
            aiMessage: null, // No message to save
          });
        }
      } catch (error) {
        console.error("❌ Socket chat:sendMessage error:", error.message);

        // Clean up abort controller if it exists
        activeStreams.delete(socket.id);

        // ── Tell client something went wrong ──
        socket.emit("chat:error", {
          message: error.message || "Failed to process message",
        });
      }
    });

    // ──────────────────────────────────────────────────────────────────
    // EVENT: chat:stopGenerating
    // ──────────────────────────────────────────────────────────────────
    //
    // Fired when the user clicks the "Stop Generating" button.
    //
    // How cancellation works:
    //   1. When we started streaming, we created an AbortController
    //      and stored it in the activeStreams Map under this socket's ID
    //   2. When this event fires, we call controller.abort()
    //   3. Inside generateStreamingResponse, the signal.aborted check
    //      becomes true, and the for-await loop breaks
    //   4. Whatever partial content was generated gets saved to DB
    //
    socket.on("chat:stopGenerating", () => {
      const controller = activeStreams.get(socket.id);
      if (controller) {
        console.log(`🛑 User ${socket.user.userId} stopped AI generation`);
        controller.abort(); // This triggers signal.aborted = true in the stream loop
        activeStreams.delete(socket.id);
      }
    });

    // ──────────────────────────────────────────────────────────────────
    // EVENT: disconnect
    // ──────────────────────────────────────────────────────────────────
    // Clean up when user disconnects (closes tab, loses internet, etc.)
    socket.on("disconnect", () => {
      console.log(
        `❎ User disconnected: ${socket.user.userId} (socket: ${socket.id})`,
      );

      // If they were mid-generation, abort it to save API costs
      const controller = activeStreams.get(socket.id);
      if (controller) {
        controller.abort();
        activeStreams.delete(socket.id);
      }
    });
  });
}

// ============================================
// Utility: Get the Socket.IO instance
// ============================================
// Used by other parts of the backend that need to emit events
// (e.g., sending notifications from a different controller)
export function getIO() {
  if (!io) {
    throw new Error("Socket is not initialized");
  }
  return io;
}
