import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useSelector } from "react-redux";

const home = () => {
  // const {handleGetMe }  = useAuth();
  // const [currUser, setUser] = useState(null);

  // const { user } = useSelector((state) => state.auth);

  // console.log("User from Redux - ", user);

  return (
    <div className="bg-green-400">
      <h1>Welcome to our AI, start chatting</h1>
    </div>
  );
};

export default home;
