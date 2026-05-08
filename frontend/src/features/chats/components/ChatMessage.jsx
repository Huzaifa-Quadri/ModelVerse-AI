import React from "react";
import { BotIcon } from "./Icons";
import MarkdownMessage from "./MarkdownMessage";

const ChatMessage = ({ msg }) => {
  return (
    <div
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
        {msg.role === "assistant" ? (
          <MarkdownMessage content={msg.content} />
        ) : (
          msg.content.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < msg.content.split("\n").length - 1 && <br />}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
