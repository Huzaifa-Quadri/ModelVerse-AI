import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Needed for Docker to bind to 0.0.0.0
    watch: {
      usePolling: true, // Needed for Windows/WSL to detect file changes inside Docker
    },
    proxy: {
      "/api": {
        target: "http://backend:4000",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://backend:4000",
        ws: true,
      },
    },
  },
});
