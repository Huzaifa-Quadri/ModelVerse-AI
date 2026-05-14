import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";

import useChat from "../hooks/useChat.hook";
import { MenuIcon } from "../components/Icons";
import Sidebar from "../components/Sidebar";
import WelcomeScreen from "../components/WelcomeScreen";
import ChatMessage from "../components/ChatMessage";
import StreamingMessage from "../components/StreamingMessage";
import TypingIndicator from "../components/TypingIndicator";
import ChatInput from "../components/ChatInput";

// ── Main Component ────────────────────────────────────────────────────────────
const Home = () => {
  // ── All chat logic comes from our hook ────────────────────────────────────
  const {
    chats, // { "chatId": { title, messages, lastUpdated } }
    currentChatId, // which chat is open right now
    currentTitle, // title of open chat (for header)
    currentMessages, // messages of open chat (array)
    isLoading, // true when any API call is running
    error, // error string or null
    isStreaming, // true while AI tokens are flowing
    streamingContent, // live AI text being built token-by-token
    fetchAllChats, // load sidebar on mount
    loadChat, // click a chat in sidebar
    sendMessage, // submit message in input (now uses socket!)
    startNewChat, // "+ New Chat" button
    deleteChatById, // delete button on sidebar
    stopGenerating, // cancel AI generation mid-stream
  } = useChat();

  // ── Local UI state (only things NOT related to chat data) ─────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [pendingUserMessage, setPendingUserMessage] = useState(null);
  const [displayedStream, setDisplayedStream] = useState("");

  useEffect(() => {
    if (!isStreaming) {
      const timeoutId = setTimeout(() => setDisplayedStream(""), 0);
      return () => clearTimeout(timeoutId);
    }

    if (displayedStream.length < streamingContent.length) {
      const diff = streamingContent.length - displayedStream.length;
      let charsToAdd = 1;

      if (diff > 200) charsToAdd = Math.floor(diff / 10);
      else if (diff > 50) charsToAdd = 3;
      else if (diff > 20) charsToAdd = 2;

      const timeoutId = setTimeout(() => {
        setDisplayedStream((prev) =>
          streamingContent.slice(0, prev.length + charsToAdd),
        );
      }, 15);
      return () => clearTimeout(timeoutId);
    }
  }, [isStreaming, streamingContent, displayedStream]);

  // ── Ref for auto-scrolling to latest message ──────────────────────────────
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const autoScrollPausedRef = useRef(false);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Allow a 150px threshold to consider as "at bottom"
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      autoScrollPausedRef.current = !isNearBottom;
    }
  }, []);

  // Reset auto-scroll pause when switching chats
  useEffect(() => {
    autoScrollPausedRef.current = false;
  }, [currentChatId]);

  const scrollMessagesToBottom = useCallback(
    (behavior = "smooth", force = false) => {
      if (autoScrollPausedRef.current && !force) return;

      const container = messagesContainerRef.current;

      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior,
        });
        return;
      }

      messagesEndRef.current?.scrollIntoView({ behavior });
    },
    [],
  );

  useEffect(() => {
    fetchAllChats();
  }, [fetchAllChats]); // fetch chats on mount

  // ── Auto scroll when messages change or streaming content updates ──────────
  useEffect(() => {
    scrollMessagesToBottom(isStreaming ? "auto" : "smooth");
  }, [
    currentMessages,
    pendingUserMessage,
    isLoading,
    displayedStream,
    isStreaming,
    scrollMessagesToBottom,
  ]);

  //* ── Handle send message ───────────────────────────────────────────────────
  // NOW USES SOCKET.IO — no longer async!
  // sendMessage() emits a socket event and returns immediately.
  // The response comes back through socket event listeners in useChat.
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;
    if (isLoading || isStreaming) return; // block during loading OR streaming

    autoScrollPausedRef.current = false; // Force auto-scroll when sending

    const messageToSend = inputMessage;
    // Optimistic UI: show user message immediately before server confirms
    const optimisticMessage = {
      _id: `pending-${Date.now()}`,
      content: messageToSend,
      role: "user",
    };

    setPendingUserMessage(optimisticMessage);
    setInputMessage("");

    // Fire-and-forget! Socket events handle the rest.
    sendMessage(messageToSend);
    // pendingUserMessage gets cleared when chat:userMessageSaved arrives
  };

  // ── Sidebar chat list from Redux store ────────────────────────────────────
  // Object.entries(chats) gives: [ ["chatId1", { title, messages }], ["chatId2", ...] ]
  // We sort by lastUpdated so most recent chat appears at top
  const sortedChats = Object.entries(chats).sort(
    ([, a], [, b]) => new Date(b.lastUpdated) - new Date(a.lastUpdated),
  );

  const displayedMessages = useMemo(() => {
    // If we're streaming or the message was saved, we don't need the optimistic message anymore
    if (!pendingUserMessage || isStreaming) {
      if (isStreaming && pendingUserMessage) {
        // Clear it behind the scenes since it's definitely saved now
        setTimeout(() => setPendingUserMessage(null), 0);
      }
      return currentMessages;
    }

    const pendingIsAlreadyStored = currentMessages.some(
      (msg) =>
        msg.role === "user" &&
        msg.content.trim() === pendingUserMessage.content.trim(),
    );

    if (pendingIsAlreadyStored) {
      // Clear it behind the scenes since we found it
      setTimeout(() => setPendingUserMessage(null), 0);
      return currentMessages;
    }

    return [...currentMessages, pendingUserMessage];
  }, [currentMessages, pendingUserMessage, isStreaming]);

  // ── Show welcome screen when no chat is open ──────────────────────────────
  const showWelcome = !currentChatId && !pendingUserMessage;

  return (
    <div className="flex h-screen w-full bg-[#0E1117] text-gray-100 overflow-hidden font-sans relative">
      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        sortedChats={sortedChats}
        currentChatId={currentChatId}
        loadChat={loadChat}
        startNewChat={startNewChat}
        deleteChatById={deleteChatById}
        isLoading={isLoading}
      />

      {/* ── MAIN CHAT AREA ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#11141c] via-[#0E1117] to-[#0E1117] transition-all relative">
        {/* Mobile menu toggle */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="sm:hidden absolute top-4 left-4 z-10 p-2.5 rounded-xl bg-[#151923] border border-[#2D3343] text-gray-400 hover:text-white shadow-lg"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        )}

        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div
            className="sm:hidden absolute inset-0 bg-black/60 z-10 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ✅ Error Banner — shows when hook sets an error */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm max-w-md w-full mx-4">
            <span className="flex-1">{error}</span>
            {/* Clicking X re-fetches chats to recover from error state */}
            <button
              onClick={fetchAllChats}
              className="text-red-300 hover:text-white font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* ✅ Active Chat Title Header — shows when a chat is open */}
        {currentTitle && (
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-4 pointer-events-none">
            <span className="text-sm text-gray-400 bg-[#0E1117]/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/5">
              {currentTitle}
            </span>
          </div>
        )}

        <div className="absolute top-0 w-full h-16 bg-linear-to-b from-[#0E1117] to-transparent pointer-events-none z-0" />

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 pb-36 custom-scrollbar z-0 relative"
        >
          <div className="w-full max-w-4xl space-y-8 mt-12 sm:mt-10 mx-auto px-2 md:px-8">
            {/* ✅ Welcome screen — show when no chat is open */}
            {showWelcome && <WelcomeScreen />}

            {/* ✅ Real messages from Redux store */}
            {displayedMessages.map((msg) => {
              const messageId = msg._id || msg.createdAt;
              return <ChatMessage key={messageId} msg={msg} />;
            })}

            {/* ✅ Live Streaming Message */}
            {isStreaming && (
              <StreamingMessage displayedStream={displayedStream} />
            )}

            {isLoading &&
              (currentChatId || pendingUserMessage) &&
              !isStreaming && <TypingIndicator />}

            <div ref={messagesEndRef} className="h-40 sm:h-48" />
          </div>
        </div>

        {/* Input Area */}
        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
          isStreaming={isStreaming}
          stopGenerating={stopGenerating}
          currentChatId={currentChatId}
        />
      </div>
    </div>
  );
};

export default Home;
