import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import chatReducer from "../features/chats/chat.slice";
const store = configureStore({
  //Store is the global state of the application or the central point of truth for the application to get access
  //Different reducers are the different parts of the state of the application ; different reducer for different parts of the state of the application
  //Todo : Have to wrap this with Provider in main.jsx to make it available to the entire application
  //? Multiple Reducer for multiple states and purpose
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
});

export default store;
