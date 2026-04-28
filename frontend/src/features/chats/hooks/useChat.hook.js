import { initializeSocketConnection } from "../service/chat.socket.js";
import {
  startChat as startChatApi,
  continueChat as continueChatApi,
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
} from "../chat.slice.js";
import { useCallback } from "react";

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

const getChatId = (chat) => chat?._id || chat?.id;

const getChatTime = (chat) =>
  new Date(chat?.lastActivity || chat?.updatedAt || chat?.createdAt || 0)
    .getTime();

export const useChat = () => {
  const dispatch = useDispatch();

  // Reading data from Redux store
  // state.chat because your slice is named "chat"
  // Every time store updates, your component automatically re-renders with new data
  const { chats, currentChatId, isLoading, error } = useSelector(
    (state) => state.chat,
  );

  const currentMessages = chats[currentChatId]?.messages || [];
  const currentChatTitle = currentChatId ? chats[currentChatId]?.title || "New Chat" : "";

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

  const loadChat = useCallback(
    async (chatId) => {
      dispatch(setError(null));

      if (chats[chatId]?.messages.length > 0) {
        dispatch(setCurrentChatId(chatId));
        persistChatId(chatId);
      }
      dispatch(setLoading(true));

      try {
        // Set this chat as active immediately (so UI switches to it right away)
        dispatch(setCurrentChatId(chatId));
        persistChatId(chatId);

        // Call GET /api/chats/:chatId/messages
        // res = { success: true, data: { messages: [...] } }
        const res = await getMessagesApi(chatId);

        // Fill this chat's messages in the store
        // setMessages does: state.chats[chatId].messages = messages
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

  // async function handleStartChat({ message }) {
  //   dispatch(setLoading(true));
  //   const data = await startChat({ message });
  //   if (data.success) {
  //     const { userResponse, assistantResponse } = data.data;
  //     dispatch(setChats());
  //   }
  // }

  const sendMessage = useCallback(
    async (message) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        if (!currentChatId) {
          // ── CASE A: NEW CHAT ─────────────────────────────────────────────
          // POST /api/chats/messages  with body: { message }
          //
          // Response looks like:
          // {
          //   data: {
          //     title: "Any Special Day Today?",
          //     userMessage: { _id, chatId: "69e89e...", content, role, createdAt, ... },
          //     aiMessage:   { _id, chatId: "69e89e...", content, role, createdAt, ... }
          //   }
          // }
          const res = await startChatApi({ message });

          // Pull out exactly what we need from the response
          const { title, userMessage, aiMessage } = res.data;

          // chatId lives inside userMessage (as seen in your Postman response)
          const chatId = userMessage.chatId;

          // Add this brand new chat to the store
          // addChat does: state.chats[chatId] = { title, messages, lastUpdated }
          dispatch(
            addChat({
              chatId, // "69e89e..." → becomes the key
              title, // "Any Special Day Today?"
              messages: [userMessage, aiMessage], // first 2 messages right away
              lastUpdated: aiMessage.createdAt, // when AI responded
            }),
          );

          // Make this new chat the active one so UI shows it
          dispatch(setCurrentChatId(chatId));
          persistChatId(chatId);
        } else {
          // ── CASE B: CONTINUE EXISTING CHAT ──────────────────────────────
          // POST /api/chats/:chatId/messages  with body: { message }
          //
          // Response looks like:
          // {
          //   data: {
          //     userMessage: { _id, chatId, content, role, createdAt, ... },
          //     aiMessage:   { _id, chatId, content, role, createdAt, ... }
          //   }
          // }
          const res = await continueChatApi({
            chatId: currentChatId, // the currently open chat
            message,
          });

          const { userMessage, aiMessage } = res.data;

          // Push both new messages into the existing chat's messages array
          // appendMessages does: state.chats[chatId].messages.push(...messages)
          dispatch(
            appendMessages({
              chatId: currentChatId,
              messages: [userMessage, aiMessage],
            }),
          );
        }
      } catch (err) {
        dispatch(setError(err.response?.data?.message || err.message));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [currentChatId, dispatch],
  );

  const startNewChat = useCallback(() => {
    // resetChat does:
    //   state.currentChatId = null  → no chat is active
    //   state.error = null          → clear errors
    //
    // Now when user types a message, sendMessage sees currentChatId is null
    // and will call startChatApi to create a brand new chat
    dispatch(resetChat());
    persistChatId(null);
  }, [dispatch]);

  // ─────────────────────────────────────────────────────────────────────────
  // 5. DELETE CHAT
  // ─────────────────────────────────────────────────────────────────────────
  const deleteChatById = useCallback(
    async (chatId) => {
      try {
        // Call DELETE /api/chats/:chatId on backend first
        await deleteChatApi(chatId);

        // If API succeeded, remove from store
        // removeChat does: delete state.chats[chatId]
        dispatch(removeChat(chatId));

        // If the chat we just deleted was the currently open one,
        // clear the view so user doesn't see a deleted chat
        if (chatId === currentChatId) {
          dispatch(resetChat());
          persistChatId(null);
        } else if (getPersistedChatId() === chatId) {
          persistChatId(null);
        }
      } catch (err) {
        dispatch(setError(err.response?.data?.message || err.message));
      }
      // No setLoading here — delete is fast and sidebar handles it visually
    },
    [dispatch, currentChatId],
  );

  return {
    initializeSocketConnection,
    // ── STATE (data to display) ──────────────────────────────────
    chats, // full map — sidebar does Object.entries(chats)
    currentChatId, // which chat is open (used for highlighting in sidebar)
    currentTitle: currentChatTitle, // title of open chat (for header)
    currentMessages, // messages of open chat (for chat window)
    isLoading, // true during API calls (show spinner)
    error, // error string or null (show error banner)

    // ── ACTIONS (functions to call) ──────────────────────────────
    fetchAllChats, // call once in useEffect on app mount
    loadChat, // call when sidebar chat is clicked → pass chatId
    sendMessage, // call when input is submitted → pass message string
    startNewChat, // call when "+ New Chat" button clicked
    deleteChatById, // call when delete button clicked → pass chatId
  };
};

export default useChat;
