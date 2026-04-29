import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app/index.css";
import App from "./app/App";
import { Provider } from "react-redux";
import store from "./app/app.store";
import { Toaster } from "sileo";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Toaster position="top-right" />
    <App />
  </Provider>,
);
