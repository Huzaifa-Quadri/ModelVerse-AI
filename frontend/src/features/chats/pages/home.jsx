import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import useChat from "../hooks/useChat.hook";

const MenuIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
    />
  </svg>
);
const PlusIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);
const SendIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
    />
  </svg>
);
const BotIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
    />
  </svg>
);
const MessageSquareIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
    />
  </svg>
);
const TrashIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Home = () => {
  // ── Auth state from Redux ──────────────────────────────────────────────────
  const { user } = useSelector((state) => state.auth);

  // ── All chat logic comes from our hook ────────────────────────────────────
  // This single line gives us everything we need
  const {
    chats, // { "chatId": { title, messages, lastUpdated } }
    currentChatId, // which chat is open right now
    currentTitle, // title of open chat (for header)
    currentMessages, // messages of open chat (array)
    isLoading, // true when any API call is running
    error, // error string or null
    fetchAllChats, // load sidebar on mount
    loadChat, // click a chat in sidebar
    sendMessage, // submit message in input
    startNewChat, // "+ New Chat" button
    deleteChatById, // delete button on sidebar chat
  } = useChat();

  // ── Local UI state (only things NOT related to chat data) ─────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [deletingChatId, setDeletingChatId] = useState(null); // tracks which chat is being deleted

  // ── Ref for auto-scrolling to latest message ──────────────────────────────
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchAllChats();
  }, []); // ← empty array means "run once on mount"

  // ── Auto scroll to bottom whenever messages change ────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]); // ← runs every time currentMessages array changes

  //* ── Handle send message ───────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Don't send if input is empty or only spaces
    if (!inputMessage.trim()) return;

    // Don't send if already waiting for a response
    if (isLoading) return;

    const messageToSend = inputMessage; // save before clearing
    setInputMessage(""); // clear input immediately (feels responsive)

    // sendMessage from hook handles everything:
    // - if no active chat → calls startChatApi (new chat)
    // - if chat is open → calls continueChatApi (continue)
    await sendMessage(messageToSend);
  };

  // ── Handle delete with local loading state ────────────────────────────────
  const handleDeleteChat = async (e, chatId) => {
    // e.stopPropagation() prevents the click from also triggering loadChat
    // (because delete button is INSIDE the chat list button)
    e.stopPropagation();

    setDeletingChatId(chatId); // show spinner on this specific chat
    await deleteChatById(chatId);
    setDeletingChatId(null); // remove spinner
  };

  // ── Sidebar chat list from Redux store ────────────────────────────────────
  // Object.entries(chats) gives: [ ["chatId1", { title, messages }], ["chatId2", ...] ]
  // We sort by lastUpdated so most recent chat appears at top
  const sortedChats = Object.entries(chats).sort(
    ([, a], [, b]) => new Date(b.lastUpdated) - new Date(a.lastUpdated),
  );

  // ── Show welcome screen when no chat is open ──────────────────────────────
  const showWelcome = !currentChatId;

  return (
    <div className="flex h-screen w-full bg-[#0E1117] text-gray-100 overflow-hidden font-sans relative">
      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <div
        className={`shrink-0 bg-[#151923] border-r border-[#2D3343]/50 transition-all duration-300 ease-in-out relative flex flex-col z-20 shadow-2xl ${
          isSidebarOpen
            ? "w-70 translate-x-0"
            : "-translate-x-full w-0 sm:translate-x-0 sm:w-18"
        } absolute sm:relative h-full`}
      >
        {/*//! Sidebar Header */}
        <div className="h-18 flex items-center justify-between px-4 border-b border-[#2D3343]/50">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl hover:bg-[#2D3343] text-gray-400 hover:text-white transition-colors flex items-center justify-center w-10 h-10 shrink-0"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          {isSidebarOpen && (
            <span className="font-semibold text-lg bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-indigo-400 truncate select-none pl-2 tracking-wide w-full pr-2">
              ModelVerse
            </span>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={startNewChat} // ✅ clears currentChatId → next message creates new chat
            className={`flex items-center gap-3 w-full p-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] border border-blue-400/20 ${!isSidebarOpen ? "justify-center p-3!" : ""}`}
          >
            <PlusIcon className="w-5 h-5 shrink-0" />
            {isSidebarOpen && (
              <span className="font-semibold whitespace-nowrap text-[15px]">
                New Chat
              </span>
            )}
          </button>
        </div>

        {/*//* Chat History List — comming from Redux containing all chats */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 custom-scrollbar">
          {isSidebarOpen ? (
            <>
              <div className="text-[11px] font-bold text-gray-500 mt-2 mb-3 px-2 uppercase tracking-wider">
                Recent Chats
              </div>

              {/* ✅ Real chats from Redux store */}
              {sortedChats.length === 0 && !isLoading && (
                // Show this when user has no chats yet
                <p className="text-gray-600 text-sm text-center mt-6 px-2">
                  No chats yet. Start a new conversation!
                </p>
              )}

              {sortedChats.map(([chatId, chatData]) => (
                <button
                  key={chatId}
                  onClick={() => loadChat(chatId)} // ✅ load this chat's messages
                  className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-left group ${
                    // Highlight the currently active chat
                    chatId === currentChatId
                      ? "bg-[#202532] text-white border border-blue-500/20"
                      : "hover:bg-[#202532] text-gray-300 hover:text-white"
                  }`}
                >
                  <MessageSquareIcon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      chatId === currentChatId
                        ? "text-blue-400"
                        : "text-gray-500 group-hover:text-gray-300"
                    }`}
                  />

                  {/* Chat title — truncated if too long */}
                  <span className="truncate text-sm font-medium flex-1">
                    {chatData.title}
                  </span>

                  {/* Delete button — only visible on hover */}
                  <span
                    onClick={(e) => handleDeleteChat(e, chatId)} // ✅ e.stopPropagation inside
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-gray-500 transition-all shrink-0"
                  >
                    {deletingChatId === chatId ? (
                      // Small spinner while this specific chat is being deleted
                      <div className="w-4 h-4 border-2 border-gray-500 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </span>
                </button>
              ))}

              {/* Loading skeleton for sidebar while fetchAllChats runs */}
              {isLoading && sortedChats.length === 0 && (
                <div className="space-y-2 mt-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-11 rounded-xl bg-[#202532] animate-pulse"
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            //? Collapsed sidebar — show icons only
            <div className="mt-2 space-y-2">
              {sortedChats.map(([chatId, chatData]) => (
                <button
                  key={chatId}
                  onClick={() => loadChat(chatId)}
                  className={`flex justify-center w-full p-3 rounded-xl transition-colors ${
                    chatId === currentChatId
                      ? "bg-[#202532] text-blue-400"
                      : "hover:bg-[#202532] text-gray-500 hover:text-gray-200"
                  }`}
                  title={chatData.title} // tooltip on hover when collapsed
                >
                  <MessageSquareIcon className="w-5 h-5 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom User Area — unchanged */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-[#2D3343]/50 bg-[#151923]">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#202532] transition-colors cursor-pointer border border-transparent hover:border-[#2D3343]">
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 shrink-0 text-lg">
                {(user ? user.name || "U" : "G").charAt(0).toUpperCase()}
              </div>
              <div className="truncate flex-1">
                <div className="text-sm font-semibold text-gray-100 truncate">
                  {user ? user.name || "User" : "Guest"}
                </div>
                <div className="text-[12px] text-gray-400 truncate">
                  {user ? user.email || "Free Plan" : "Sign in required"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-36 scroll-smooth flex justify-center custom-scrollbar z-0 relative">
          <div className="w-full max-w-4xl space-y-8 mt-12 sm:mt-10 mx-auto px-2 md:px-8">
            {/* ✅ Welcome screen — show when no chat is open */}
            {showWelcome && (
              <div className="text-center mt-12 mb-20">
                <div className="w-24 h-24 mx-auto bg-linear-to-tr from-blue-500 via-indigo-500 to-purple-600 rounded-4xl p-0.5 shadow-[0_0_40px_rgba(59,130,246,0.3)] mb-8 transform hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full bg-[#0E1117]/90 backdrop-blur-2xl rounded-[30px] flex items-center justify-center">
                    <BotIcon className="w-12 h-12 text-gray-100" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-100 via-gray-200 to-gray-400 mb-4 tracking-tight">
                  How can I help you today?
                </h2>
                <p className="text-gray-400 text-lg max-w-md mx-auto">
                  Experience the next generation of AI by interacting with
                  ModelVerse.
                </p>
              </div>
            )}

            {/* ✅ Real messages from Redux store */}
            {currentMessages.map((msg) => (
              <div
                key={msg._id} // ← using MongoDB _id now, not fake Date.now()
                className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"} w-full`}
              >
                {msg.role === "assistant" && (
                  <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-600 flex items-center justify-center mr-3 sm:mr-5 mt-1 shadow-lg shadow-purple-500/20 border border-white/5">
                    <BotIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] md:max-w-[80%] px-6 py-4 rounded-3xl text-[15px] sm:text-[16px] leading-relaxed shadow-sm ${
                    msg.role === "assistant"
                      ? "bg-[#151923] border border-white/5 text-gray-200 rounded-tl-sm shadow-black/20 font-light"
                      : "bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-[0_4px_20px_rgba(37,99,235,0.2)] border border-blue-400/20 font-normal"
                  }`}
                >
                  {/* Render message content — preserves line breaks from AI */}
                  {msg.content.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* ✅ AI Typing Indicator — shows while waiting for AI response */}
            {isLoading && currentChatId && (
              <div className="flex justify-start w-full">
                <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-600 flex items-center justify-center mr-3 sm:mr-5 mt-1 shadow-lg border border-white/5">
                  <BotIcon className="w-5 h-5 text-white" />
                </div>
                <div className="bg-[#151923] border border-white/5 px-6 py-4 rounded-3xl rounded-tl-sm">
                  <div className="flex gap-1.5 items-center h-5">
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-linear-to-t from-[#0E1117] via-[#0E1117] to-transparent pt-32 pb-8 px-4 pointer-events-none">
          <div className="max-w-4xl mx-auto w-full relative pointer-events-auto px-2 md:px-8">
            <form
              onSubmit={handleSendMessage}
              className="relative flex items-end group"
            >
              <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-purple-600 rounded-4xl blur opacity-10 group-focus-within:opacity-30 transition duration-500" />
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={
                  // Placeholder changes based on context — nice UX touch
                  isLoading
                    ? "ModelVerse is thinking..."
                    : currentChatId
                      ? "Continue the conversation..."
                      : "Ask ModelVerse anything..."
                }
                // ✅ Disable input while loading so user can't spam send
                disabled={isLoading}
                className={`w-full bg-[#1A1D27] border border-white/10 text-gray-100 placeholder-gray-500 rounded-4xl py-4 sm:py-5 pl-7 pr-16 outline-none focus:border-blue-500/40 focus:bg-[#1C202B] transition-all resize-none overflow-hidden max-h-40 text-[15px] sm:text-[16px] custom-scrollbar shadow-2xl relative z-10 ${
                  isLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
                rows={1}
                style={{ minHeight: "60px" }}
              />
              <button
                type="submit"
                // ✅ Disable when empty OR when loading
                disabled={!inputMessage.trim() || isLoading}
                className={`absolute right-3 bottom-2.5 sm:bottom-3 p-3 sm:p-3.5 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
                  inputMessage.trim() && !isLoading
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30"
                    : "bg-transparent text-gray-600 scale-95"
                }`}
              >
                {/* Show spinner in send button while loading */}
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin" />
                ) : (
                  <SendIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </form>
            <div className="text-center mt-4 text-[12px] text-gray-500/80 font-medium">
              ModelVerse AI can make mistakes. Verify important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
