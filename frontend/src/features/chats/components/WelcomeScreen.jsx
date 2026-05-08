import React from "react";
import { BotIcon } from "./Icons";

const WelcomeScreen = () => {
  return (
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
  );
};

export default WelcomeScreen;
