import { initializeSocketConnection } from "../service/chat.socket.js";

export const useChat = () => {
  return {
    initializeSocketConnection,
  };
};
