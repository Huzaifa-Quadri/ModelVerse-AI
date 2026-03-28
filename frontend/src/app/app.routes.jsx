import { createBrowserRouter } from "react-router-dom";
import Login from "../features/auth/pages/login";
import Register from "../features/auth/pages/register";

export const route = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);
