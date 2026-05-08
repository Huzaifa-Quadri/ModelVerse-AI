import React from "react";
import { SendIcon, StopIcon } from "./Icons";

const ChatInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isLoading,
  isStreaming,
  stopGenerating,
  currentChatId,
}) => {
  return (
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
              isLoading
                ? "ModelVerse is thinking..."
                : currentChatId
                  ? "Continue the conversation..."
                  : "Ask ModelVerse anything..."
            }
            disabled={isLoading}
            className={`w-full bg-[#1A1D27] border border-white/10 text-gray-100 placeholder-gray-500 rounded-4xl py-4 sm:py-5 pl-7 pr-18 outline-none focus:border-blue-500/40 focus:bg-[#1C202B] transition-all resize-none overflow-hidden max-h-40 text-[15px] sm:text-[16px] custom-scrollbar shadow-2xl relative z-10 ${
              isLoading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            rows={1}
            style={{ minHeight: "60px" }}
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                stopGenerating();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-20 bg-red-600/90 text-white hover:bg-red-500 shadow-lg shadow-red-500/30"
              title="Stop Generating"
            >
              <StopIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
                inputMessage.trim() && !isLoading
                  ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30"
                  : "bg-transparent text-gray-600 scale-95"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin" />
              ) : (
                <SendIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          )}
        </form>
        <div className="text-center mt-4 text-[12px] text-gray-500/80 font-medium">
          ModelVerse AI can make mistakes. Verify important information.
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
