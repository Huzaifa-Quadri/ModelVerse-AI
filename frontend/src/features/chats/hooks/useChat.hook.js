import { initializeSocketConnection } from "../service/chat.socket.js";
import {
  startChat,
  continueChat,
  getAllChats,
  getMessages,
  deleteChat,
} from "../service/api.chat.js";
import { useDispatch } from "react-redux";
import { setChats, setLoading } from "../chat.slice.js";

export const useChat = () => {
  const dispatch = useDispatch();

  async function handleStartChat({message}) {
    dispatch(setLoading(true));
    const data = await startChat({message});
    if(data.success){
      const {userResponse, assistantResponse} = data.data;
      dispatch(setChats())
    }
    
  }


  return {
    initializeSocketConnection,
    startChat,
    continueChat,
    getAllChats,
    getMessages,
    deleteChat,
  };
};
