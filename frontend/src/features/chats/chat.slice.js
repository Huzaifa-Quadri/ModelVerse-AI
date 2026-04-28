import { createSlice } from "@reduxjs/toolkit";

// ============================================
// Chat Slice — Redux State for Chat Feature
// ============================================
//
// This slice manages ALL chat-related state in the app:
//   1. chats       → Map of all user's chats (sidebar data)
//   2. currentChat → Which chat is currently open
//   3. loading     → Is an API call in progress?
//   4. error       → Did something go wrong?
//   5. streaming   → NEW: Is AI currently streaming tokens?
//
// WHAT'S NEW (Socket.IO Streaming):
// ──────────────────────────────────
// We added `isStreaming` and `streamingContent` to support real-time
// AI token streaming. Here's how they work together:
//
//   1. User sends message → isStreaming stays false (waiting for first token)
//   2. First "ai:token" arrives → startStreaming() sets isStreaming = true
//   3. Each subsequent "ai:token" → appendToken() adds text to streamingContent
//   4. "ai:complete" arrives → finishStreaming() clears streaming state
//
// The UI reads `streamingContent` to show the "live" AI message being
// built token-by-token, creating the real-time typing effect.

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: {},
    //  chats map structure:
    //  {
    //    "chatId123": {
    //      title: "JavaScript Tips",
    //      messages: [ { _id, content, role, createdAt }, ... ],
    //      lastUpdated: "2026-04-07T05:17:04.567Z"
    //    }
    //  }

    currentChatId: null, // which chat is open right now (null = welcome screen)
    isLoading: false, // true during REST API calls (fetch chats, load messages)
    error: null, // error message string or null

    // ── NEW: Streaming state ──
    isStreaming: false, // true while AI tokens are flowing in real-time
    streamingContent: "", // accumulates tokens: "" → "Hello" → "Hello world" → ...
  },

  reducers: {
    // ── Existing reducers (unchanged) ──────────────────────────────

    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },

    // adds a brand new chat to the map after startChat API
    addChat: (state, action) => {
      const { chatId, title, messages, lastUpdated } = action.payload;
      state.chats[chatId] = {
        title,
        messages,
        lastUpdated,
      };
    },

    // loads messages into a chat after getMessages API
    setMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      if (state.chats[chatId]) {
        state.chats[chatId].messages = messages;
      }
    },

    //* pushes 2 new messages after continueChat API
    appendMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      if (state.chats[chatId]) {
        state.chats[chatId].messages.push(...messages);
        state.chats[chatId].lastUpdated = new Date().toISOString();
      }
    },

    removeChat: (state, action) => {
      delete state.chats[action.payload];
    },

    //? clears active chat when "New Chat" button clicked
    resetChat: (state) => {
      state.currentChatId = null;
      state.error = null;
    },

    // ── NEW: Streaming reducers ──────────────────────────────────────

    // ┌─────────────────────────────────────────────────────────────┐
    // │ startStreaming                                              │
    // ├─────────────────────────────────────────────────────────────┤
    // │ Called when the first "ai:token" event arrives.             │
    // │ Sets isStreaming = true so the UI shows the streaming       │
    // │ message bubble instead of the loading dots.                 │
    // │ Resets streamingContent to empty string.                    │
    // └─────────────────────────────────────────────────────────────┘
    startStreaming: (state) => {
      state.isStreaming = true;
      state.streamingContent = "";
    },

    // ┌─────────────────────────────────────────────────────────────┐
    // │ appendToken                                                │
    // ├─────────────────────────────────────────────────────────────┤
    // │ Called for EACH "ai:token" event.                           │
    // │ Appends the new token to streamingContent.                  │
    // │                                                             │
    // │ Example sequence:                                           │
    // │   appendToken("Hello")  → streamingContent = "Hello"        │
    // │   appendToken(" world") → streamingContent = "Hello world"  │
    // │   appendToken("!")      → streamingContent = "Hello world!" │
    // │                                                             │
    // │ The UI component reads streamingContent and renders it      │
    // │ through MarkdownMessage, so formatting works in real-time.  │
    // └─────────────────────────────────────────────────────────────┘
    appendToken: (state, action) => {
      state.streamingContent += action.payload;
    },

    // ┌─────────────────────────────────────────────────────────────┐
    // │ finishStreaming                                             │
    // ├─────────────────────────────────────────────────────────────┤
    // │ Called when "ai:complete" event arrives.                     │
    // │ Resets all streaming state back to initial values.           │
    // │                                                             │
    // │ At this point:                                               │
    // │   1. The complete AI message has been saved to MongoDB       │
    // │   2. appendMessages has added it to the chat's messages[]   │
    // │   3. We clear streaming state so the regular message        │
    // │      rendering takes over (no more streaming bubble)        │
    // └─────────────────────────────────────────────────────────────┘
    finishStreaming: (state) => {
      state.isStreaming = false;
      state.streamingContent = "";
    },
  },
});

export const {
  setChats,
  setCurrentChatId,
  setLoading,
  setError,
  addChat,
  setMessages,
  appendMessages,
  removeChat,
  resetChat,
  // NEW: Streaming actions
  startStreaming,
  appendToken,
  finishStreaming,
} = chatSlice.actions;

export default chatSlice.reducer;
