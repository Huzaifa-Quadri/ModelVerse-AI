import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";

const home = () => {
  const { user } = useSelector((state) => state.auth);
  const chat = useChat();

  console.log("User from Redux - ", user);

  useEffect(() => {
    chat.initializeSocketConnection();
  }, []);

  return (
    <div className="bg-green-400">
      <h1>Welcome to our AI, start chatting</h1>
    </div>
  );
};

export default home;
