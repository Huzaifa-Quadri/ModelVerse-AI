import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: {},
    currentChatId: null,
    isLoading: false,
    error: null,
  },

  reducers: {
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
} = chatSlice.actions;
export default chatSlice.reducer;

//Sample chat data (what i am thinking of doing)
// chats = {
//   "i am feeling good today" : //chat - title
//  {
//     messages : [
//       {
//         role : "user",
//         content : "i am feeling good today"
//       },
//       {
//         role : "assistant",
//         content : "Great, how can i help you today ?!"
//       }
//     ],
//     id : "dhi&6bdkk7hjnHJ",
//     lastUpdated : "2026-04-07T05:17:04.567Z"
//   }
// }
