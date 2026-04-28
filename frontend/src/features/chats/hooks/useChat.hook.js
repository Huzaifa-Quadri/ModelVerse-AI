// ============================================
// useChat Hook — The Brain of the Chat Feature
// ============================================
//
// This hook is the single source of truth for all chat logic.
// Every chat action (send, load, delete, fetch) goes through here.
//
// WHAT CHANGED (Socket.IO Integration):
// ─────────────────────────────────────
// BEFORE: sendMessage() called REST APIs (startChatApi / continueChatApi)
//         → waited 2-10 seconds → got entire AI response at once
//
// AFTER:  sendMessage() emits a socket event ("chat:sendMessage")
//         → server streams AI tokens back one-by-one via "ai:token" events
//         → each token updates Redux → UI renders in real-time
//
// WHAT STAYED THE SAME:
// ─────────────────────
// fetchAllChats, loadChat, deleteChatById → still use REST (axios)
// These are simple CRUD operations that don't need real-time streaming.
//
// NEW FEATURES:
// ─────────────
// - stopGenerating() → cancels AI generation mid-stream
// - isStreaming       → true while AI tokens are flowing
// - streamingContent  → the live AI text being built token-by-token

import { getSocket } from "../service/chat.socket.js";
import {
  getAllChats as getAllChatsApi,
  getMessages as getMessagesApi,
  deleteChat as deleteChatApi,
} from "../service/api.chat.js";
import { useDispatch, useSelector } from "react-redux";
import {
  setChats,
  setCurrentChatId,
  addChat,
  setMessages,
  appendMessages,
  removeChat,
  resetChat,
  setLoading,
  setError,
  // NEW: Streaming actions
  startStreaming,
  appendToken,
  finishStreaming,
} from "../chat.slice.js";
import { useCallback, useEffect, useRef } from "react";

// ============================================
// localStorage helpers for persisting active chat
// ============================================
// When the user refreshes the page, we want to re-open the chat
// they were looking at. These helpers save/load the currentChatId.
const CURRENT_CHAT_STORAGE_KEY = "modelverse.currentChatId";

const getPersistedChatId = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CURRENT_CHAT_STORAGE_KEY);
};

const persistChatId = (chatId) => {
  if (typeof window === "undefined") return;

  if (chatId) {
    window.localStorage.setItem(CURRENT_CHAT_STORAGE_KEY, chatId);
  } else {
    window.localStorage.removeItem(CURRENT_CHAT_STORAGE_KEY);
  }
};

// ── Helper: Extract chatId from MongoDB document ──
const getChatId = (chat) => chat?._id || chat?.id;

// ── Helper: Get timestamp for sorting chats ──
const getChatTime = (chat) =>
  new Date(
    chat?.lastActivity || chat?.updatedAt || chat?.createdAt || 0,
  ).getTime();

export const useChat = () => {
  const dispatch = useDispatch();

  // ── Read state from Redux store ──
  // Every time any of these values change in the store,
  // this component automatically re-renders with new data.
  const {
    chats,
    currentChatId,
    isLoading,
    error,
    isStreaming,
    streamingContent,
  } = useSelector((state) => state.chat);

  // Derived values (computed from store data)
  const currentMessages = chats[currentChatId]?.messages || [];
  const currentChatTitle = currentChatId
    ? chats[currentChatId]?.title || "New Chat"
    : "";

  // ── Refs for socket event handlers ──
  // We use refs so the socket listeners always see the latest state
  // without needing to re-register listeners on every render.
  //
  // WHY refs instead of direct state?
  // Socket.IO listeners are registered once (in useEffect).
  // If we used currentChatId directly inside those listeners,
  // they'd capture the value at registration time (stale closure).
  // Refs always point to the latest value.
  const currentChatIdRef = useRef(currentChatId);
  const chatsRef = useRef(chats);

  // Keep refs in sync with Redux state
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // ── Track if socket listeners are already registered ──
  // Prevents duplicate listeners if the hook re-initializes
  const socketListenersRegistered = useRef(false);

  // ============================================
  // Socket.IO Event Listeners Setup
  // ============================================
  //
  // This useEffect runs ONCE on mount and sets up listeners
  // for all the events the server emits during chat:sendMessage.
  //
  // Event flow (what the server sends → what we do here):
  //
  //   1. "chat:created"          → New chat was created → add to sidebar
  //   2. "chat:userMessageSaved" → User msg saved in DB → add to messages
  //   3. "ai:streamStart"        → AI is about to stream → show streaming UI
  //   4. "ai:token"              → One word/token from AI → append to streaming content
  //   5. "ai:complete"           → AI finished → save final message, clear streaming
  //   6. "chat:error"            → Something went wrong → show error
  //
  useEffect(() => {
    // Don't register listeners twice
    if (socketListenersRegistered.current) return;

    const socket = getSocket();
    socketListenersRegistered.current = true;

    // ──────────────────────────────────────────────────────────────
    // EVENT: chat:created
    // ──────────────────────────────────────────────────────────────
    // Server sends this when a NEW chat was created (no chatId was provided).
    // We add it to the chats map so it appears in the sidebar immediately.
    //
    // Data received: { chatId: "abc123", title: "JavaScript Tips" }
    //
    socket.on("chat:created", ({ chatId, title }) => {
      console.log("📨 chat:created", chatId, title);

      // Add the new chat to Redux store (appears in sidebar)
      dispatch(
        addChat({
          chatId,
          title,
          messages: [], // Messages will be added via subsequent events
          lastUpdated: new Date().toISOString(),
        }),
      );

      // Make this new chat the active one (UI switches to it)
      dispatch(setCurrentChatId(chatId));
      persistChatId(chatId);
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: chat:userMessageSaved
    // ──────────────────────────────────────────────────────────────
    // Server confirms the user's message was saved to MongoDB.
    // We add it to the chat's messages array with the real MongoDB _id.
    //
    // Data received: {
    //   chatId: "abc123",
    //   userMessage: { _id, content, role, createdAt },
    //   isNewChat: true/false
    // }
    //
    socket.on("chat:userMessageSaved", ({ chatId, userMessage, isNewChat }) => {
      console.log("📨 chat:userMessageSaved", chatId);

      // If this is a new chat, the chat was already added via "chat:created"
      // but might not have the chatId set in messages yet.
      // For existing chats, we just append the user message.

      // Check if the chat exists in our store
      if (chatsRef.current[chatId]) {
        dispatch(
          appendMessages({
            chatId,
            messages: [userMessage],
          }),
        );
      } else if (isNewChat) {
        // Edge case: chat:created might not have processed yet
        // Add the chat with the user message
        dispatch(
          addChat({
            chatId,
            title: "New Chat",
            messages: [userMessage],
            lastUpdated: new Date().toISOString(),
          }),
        );
        dispatch(setCurrentChatId(chatId));
        persistChatId(chatId);
      }
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: ai:streamStart
    // ──────────────────────────────────────────────────────────────
    // Server is about to start streaming tokens.
    // We set isStreaming = true so the UI shows the streaming bubble.
    //
    socket.on("ai:streamStart", () => {
      console.log("📨 ai:streamStart");
      dispatch(startStreaming());
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: ai:token
    // ──────────────────────────────────────────────────────────────
    // A single token/word from Gemini AI.
    // We append it to streamingContent in Redux.
    //
    // This event fires RAPIDLY — possibly hundreds of times per response.
    // Each call updates Redux → React re-renders → user sees new text.
    //
    // Data received: { chatId: "abc123", token: "Hello" }
    //
    // Timeline example:
    //   ai:token { token: "Hello" }     → streamingContent: "Hello"
    //   ai:token { token: " there" }    → streamingContent: "Hello there"
    //   ai:token { token: "!" }         → streamingContent: "Hello there!"
    //   ai:token { token: " How" }      → streamingContent: "Hello there! How"
    //   ... and so on
    //
    socket.on("ai:token", ({ token }) => {
      dispatch(appendToken(token));
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: ai:complete
    // ──────────────────────────────────────────────────────────────
    // AI finished generating. The complete response has been saved to MongoDB.
    // We add the final AI message to the chat's messages array and
    // clear all streaming state.
    //
    // Data received: {
    //   chatId: "abc123",
    //   aiMessage: { _id, content, role, createdAt } | null
    // }
    //
    // After this event:
    //   - isStreaming = false
    //   - streamingContent = ""
    //   - The AI message appears as a regular message in the chat
    //   - Input box is re-enabled
    //
    socket.on("ai:complete", ({ chatId, aiMessage }) => {
      console.log("📨 ai:complete", chatId);

      if (aiMessage) {
        // Add the final AI message to the chat's messages array
        dispatch(
          appendMessages({
            chatId,
            messages: [aiMessage],
          }),
        );
      }

      // Clear streaming state → UI switches from streaming bubble to normal message
      dispatch(finishStreaming());
      dispatch(setLoading(false));
    });

    // ──────────────────────────────────────────────────────────────
    // EVENT: chat:error
    // ──────────────────────────────────────────────────────────────
    // Something went wrong on the server (DB error, AI error, etc.)
    // We show the error banner and clear loading/streaming state.
    //
    socket.on("chat:error", ({ message }) => {
      console.error("📨 chat:error:", message);
      dispatch(setError(message));
      dispatch(finishStreaming());
      dispatch(setLoading(false));
    });

    // ── Cleanup on unmount ──
    // Remove all listeners to prevent memory leaks
    return () => {
      socket.off("chat:created");
      socket.off("chat:userMessageSaved");
      socket.off("ai:streamStart");
      socket.off("ai:token");
      socket.off("ai:complete");
      socket.off("chat:error");
      socketListenersRegistered.current = false;
    };
  }, [dispatch]);

  // ============================================
  // 1. FETCH ALL CHATS (REST — unchanged)
  // ============================================
  // Loads the sidebar with all user's chats on app mount.
  // Still uses REST because this is a one-time load — no streaming needed.
  const fetchAllChats = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const res = await getAllChatsApi();
      const chatList = Array.isArray(res.data?.chats) ? res.data.chats : [];
      const sortedChatList = [...chatList].sort(
        (a, b) => getChatTime(b) - getChatTime(a),
      );
      const chatsMap = sortedChatList.reduce((map, chat) => {
        const chatId = getChatId(chat);
        if (!chatId) return map;

        map[chatId] = {
          title: chat.title || "Untitled Chat",
          messages: [],
          lastUpdated: chat.lastActivity || chat.updatedAt || chat.createdAt,
        };
        return map;
      }, {});

      dispatch(setChats(chatsMap));

      const persistedChatId = getPersistedChatId();
      const fallbackChatId = getChatId(sortedChatList[0]);
      const chatIdToOpen =
        persistedChatId && chatsMap[persistedChatId]
          ? persistedChatId
          : fallbackChatId;

      if (!chatIdToOpen) {
        dispatch(setCurrentChatId(null));
        persistChatId(null);
        return;
      }

      dispatch(setCurrentChatId(chatIdToOpen));
      persistChatId(chatIdToOpen);

      const messagesRes = await getMessagesApi(chatIdToOpen);
      dispatch(
        setMessages({
          chatId: chatIdToOpen,
          messages: messagesRes.data?.messages || [],
        }),
      );
    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // ============================================
  // 2. LOAD CHAT (REST)
  // ============================================
  const loadChat = useCallback(
    async (chatId) => {
      dispatch(setError(null));

      if (chats[chatId]?.messages.length > 0) {
        dispatch(setCurrentChatId(chatId));
        persistChatId(chatId);
      }
      dispatch(setLoading(true));

      try {
        dispatch(setCurrentChatId(chatId));
        persistChatId(chatId);

        const res = await getMessagesApi(chatId);

        dispatch(
          setMessages({
            chatId,
            messages: res.data.messages,
          }),
        );
      } catch (err) {
        dispatch(setError(err.response?.data?.message || err.message));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, chats],
  );

  // ============================================
  // 3. SEND MESSAGE (SOCKET.IO!)
  // ============================================
  //
  // BEFORE (REST):
  //   1. Call POST /api/chats/messages (or /:chatId/messages)
  //   2. Wait 2-10 seconds for Gemini to finish
  //   3. Get entire response at once
  //   4. Fake a typing animation
  //
  // AFTER (Socket.IO):
  //   1. Emit "chat:sendMessage" with { chatId, message }
  //   2. Server processes and streams tokens back
  //   3. Each "ai:token" event updates Redux → UI shows words appearing
  //   4. No fake animation needed — it's REAL real-time
  //
  // The function itself is now very simple because all the heavy lifting
  // happens in the socket event listeners (set up in useEffect above).
  // We just emit the event and let the listeners handle everything.
  //
  const sendMessage = useCallback(
    (message) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const socket = getSocket();

      // Emit the message to the server via WebSocket
      // The server will respond with a series of events:
      //   chat:created (if new) → chat:userMessageSaved → ai:streamStart → ai:token (many) → ai:complete
      socket.emit("chat:sendMessage", {
        chatId: currentChatId, // null = create new chat, "abc123" = continue existing
        message,
      });

      // NOTE: We don't await anything here!
      // Unlike REST where we `await startChatApi(...)`, socket events are
      // fire-and-forget. The response comes back through the event listeners
      // we set up in useEffect. This is the fundamental difference between
      // request/response (REST) and event-driven (Socket.IO) architecture.
    },
    [currentChatId, dispatch],
  );

  // ============================================
  // 4. START NEW CHAT
  // ============================================
  const startNewChat = useCallback(() => {
    dispatch(resetChat());
    persistChatId(null);
  }, [dispatch]);

  // ============================================
  // 5. DELETE CHAT (REST)
  // ============================================
  const deleteChatById = useCallback(
    async (chatId) => {
      try {
        await deleteChatApi(chatId);

        dispatch(removeChat(chatId));

        if (chatId === currentChatId) {
          dispatch(resetChat());
          persistChatId(null);
        } else if (getPersistedChatId() === chatId) {
          persistChatId(null);
        }
      } catch (err) {
        dispatch(setError(err.response?.data?.message || err.message));
      }
    },
    [dispatch, currentChatId],
  );

  // ============================================
  // 6. STOP GENERATING (⚡ NEW!)
  // ============================================
  //
  // Allows the user to cancel AI generation mid-stream.
  //
  // How it works:
  //   1. User clicks "Stop Generating" button in the UI
  //   2. We emit "chat:stopGenerating" to the server
  //   3. Server calls abortController.abort()
  //   4. generateStreamingResponse breaks out of its loop
  //   5. Server saves whatever partial content was generated
  //   6. Server emits "ai:complete" with the partial message
  //   7. Our ai:complete listener clears streaming state
  //
  const stopGenerating = useCallback(() => {
    const socket = getSocket();
    socket.emit("chat:stopGenerating");
    // The ai:complete event listener will handle clearing the streaming state
  }, []);

  // ============================================
  // Return everything the UI needs
  // ============================================
  return {
    // ── STATE (data to display) ──────────────────────────────────
    chats, // full map — sidebar does Object.entries(chats)
    currentChatId, // which chat is open (used for highlighting in sidebar)
    currentTitle: currentChatTitle, // title of open chat (for header)
    currentMessages, // messages of open chat (for chat window)
    isLoading, // true during API calls (show spinner)
    error, // error string or null (show error banner)

    // ── NEW: Streaming state ──────────────────────────────────────
    isStreaming, // true while AI tokens are flowing
    streamingContent, // the live AI text: "" → "Hello" → "Hello world" → ...

    // ── ACTIONS (functions to call) ──────────────────────────────
    fetchAllChats, // call once in useEffect on app mount
    loadChat, // call when sidebar chat is clicked → pass chatId
    sendMessage, // call when input is submitted → pass message string
    startNewChat, // call when "+ New Chat" button clicked
    deleteChatById, // call when delete button clicked → pass chatId
    stopGenerating, // call when "Stop Generating" button clicked (NEW!)
  };
};

export default useChat;
