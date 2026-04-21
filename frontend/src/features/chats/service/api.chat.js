import axios from axios;

const baseUrl = "http://localhost:4000/api/chats";

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
})

export const startChat = async ({message})=>{
  const response = await api.post("/messages", {message});
  return response.data;
}

export const continueChat = async ({chatId, message})=>{
  const response = await api.post(`/${chatId}/messages`, {message});
  return response.data;
}

export const getAllChats = async ()=>{
  const response = await api.get("/");
  return response.data;
}

export const getMessages = async (chatId)=> {
  const response = await api.get(`/${chatId}/messages`);
  return response.data;
}

export const deleteChat = async (chatId)=>{
  const response = await api.delete(`/${chatId}`);
  return response.data;
}