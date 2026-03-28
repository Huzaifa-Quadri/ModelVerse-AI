import { createBrowserRouter } from "react-router-dom";
import Login from "../features/auth/pages/login";
import Register from "../features/auth/pages/register";
import Home from "../features/chats/pages/home";
import Protected from "../features/auth/components/protected";

export const route = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <Home />
      </Protected>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);
