import React from "react";
import { RouterProvider } from "react-router-dom";
import { route } from "./app.routes";

const App = () => {
  return <RouterProvider router={route} />;
};

export default App;
