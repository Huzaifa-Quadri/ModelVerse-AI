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
    setChats: (state, chats) => {
      state.chats = action.payload;
    },
    setCurrentChatid: (state, action) => {
      state.currentChatId = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});
export const { setChats, setCurrentChatid, setLoading, setError } =
  chatSlice.actions;
export default chatSlice.reducer;

//Sample chat data
// chats = {
//   "i am feeling good today" : {
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
