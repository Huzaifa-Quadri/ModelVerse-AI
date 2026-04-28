// ============================================
// Socket.IO Client — Singleton Manager
// ============================================
//
// WHY A SINGLETON?
// ────────────────
// Without a singleton, every component that needs the socket would call
// io("http://localhost:4000"), creating a NEW connection each time.
// With 5 components, that's 5 simultaneous WebSocket connections — wasteful
// and causes duplicate event handling (same message received 5 times).
//
// The singleton pattern ensures:
//   - Only ONE socket connection exists for the entire app
//   - Every component that calls getSocket() gets the SAME socket instance
//   - Events are received exactly once
//
// HOW IT WORKS:
// ─────────────
//   1. First call to getSocket() → creates the connection, stores in `socket`
//   2. All subsequent calls → return the same `socket` instance
//   3. disconnectSocket() → cleanly closes the connection (e.g., on logout)
//
// WHEN DOES IT CONNECT?
// ─────────────────────
// The socket connects when useChat hook initializes (on app mount).
// It stays connected for the entire session. Socket.IO handles
// auto-reconnection if the connection drops temporarily.

import { io } from "socket.io-client";

// ── Module-level variable ──
// This holds the single socket instance for the entire app.
// null = not connected yet, socket object = connected
let socket = null;

// ── Server URL ──
// In development, Vite proxies /api to localhost:4000 via vite.config.js,
// but Socket.IO doesn't go through the Vite proxy — it needs the direct URL.
// In production, this would be your deployed backend URL.
const SOCKET_URL = "http://localhost:4000";

// ============================================
// getSocket() — Get or create the socket connection
// ============================================
//
// Usage:
//   import { getSocket } from "./chat.socket.js";
//   const socket = getSocket();  // always returns the same instance
//   socket.emit("chat:sendMessage", { ... });
//
// The `withCredentials: true` option is CRITICAL — it tells the browser
// to include cookies (our JWT token) in the WebSocket handshake request.
// Without this, the server's authenticateSocket middleware would fail
// because it wouldn't find the token cookie.
//
export function getSocket() {
  // If we already have a connected socket, return it (singleton)
  if (socket && socket.connected) {
    return socket;
  }

  // First time — create the connection
  socket = io(SOCKET_URL, {
    withCredentials: true, // Include cookies (JWT) in the handshake
    // Socket.IO auto-reconnection settings (built-in, enabled by default)
    // reconnection: true,        // automatically try to reconnect
    // reconnectionAttempts: 5,   // try 5 times before giving up
    // reconnectionDelay: 1000,   // wait 1 second between attempts
  });

  // ── Connection lifecycle logging ──
  // These help with debugging — you'll see these in browser console

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    // reason tells us WHY it disconnected:
    //   "io server disconnect" → server kicked us (auth failed?)
    //   "io client disconnect" → we called socket.disconnect()
    //   "transport close"      → network issue / server crashed
    //   "ping timeout"         → server stopped responding
    console.log("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    // This fires when the connection or authentication fails.
    // Most common causes:
    //   1. Server is down
    //   2. JWT token expired/invalid (auth middleware rejected us)
    //   3. CORS misconfiguration
    console.error("❌ Socket connection error:", error.message);
  });

  return socket;
}

// ============================================
// disconnectSocket() — Clean disconnect
// ============================================
//
// Call this when the user logs out or the app unmounts.
// Cleanly closes the WebSocket connection and resets the singleton
// so the next getSocket() call creates a fresh connection.
//
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket manually disconnected");
  }
}
