import React from "react";
import { BotIcon } from "./Icons";

const TypingIndicator = () => {
  return (
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
  );
};

export default TypingIndicator;
