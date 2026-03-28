import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { route } from "./app.routes";
import { useAuth } from "../features/auth/hooks/useAuth";

const App = () => {
  const { handleGetMe } = useAuth();

  useEffect(() => {
    handleGetMe();
  }, []);

  return <RouterProvider router={route} />;
};

export default App;
