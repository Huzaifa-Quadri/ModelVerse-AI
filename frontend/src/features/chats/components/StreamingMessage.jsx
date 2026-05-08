import React from "react";
import { BotIcon } from "./Icons";
import MarkdownMessage from "./MarkdownMessage";

const StreamingMessage = ({ displayedStream }) => {
  return (
    <div className="flex justify-start w-full">
      <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-600 flex items-center justify-center mr-3 sm:mr-5 mt-1 shadow-lg shadow-purple-500/20 border border-white/5">
        <BotIcon className="w-5 h-5 text-white" />
      </div>
      <div className="max-w-[85%] md:max-w-[80%] px-6 py-4 rounded-3xl text-[15px] sm:text-[16px] leading-relaxed shadow-sm bg-[#151923] border border-white/5 text-gray-200 rounded-tl-sm shadow-black/20 font-light">
        <MarkdownMessage content={displayedStream + " █"} />
      </div>
    </div>
  );
};

export default StreamingMessage;
