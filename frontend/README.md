# ModelVerse AI - Frontend

This is the frontend client for **ModelVerse AI**, a comprehensive AI chatbot platform with real-time streaming capabilities.

## 🛠️ Tech Stack

- **Framework**: React 19, Vite
- **State Management**: Redux Toolkit (RTK)
- **Styling**: TailwindCSS v4
- **Routing**: React Router DOM v7
- **Real-time Communication**: Socket.io-client
- **HTTP Client**: Axios
- **Notifications**: Sileo

## 🚀 Getting Started

Follow these instructions to set up the frontend locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### 1. Installation

Ensure you are in the `frontend` directory and install the dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the `frontend/` directory with the following configuration:

```env
VITE_BACKEND_URL=http://localhost:5000
```

*Note: Ensure the backend is running on the specified port to allow API calls and WebSocket connections.*

### 3. Running the Development Server

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## 🏗️ Architecture & Features

- **Real-Time Streaming**: Uses Socket.IO to receive streamed tokens from the backend for an interactive, ChatGPT-like experience.
- **Client-Side Routing**: Implemented via React Router DOM. Vercel deployment includes a `vercel.json` for proper SPA routing fallback.
- **State Management**: Centralized store using Redux Toolkit to manage authentication and chat history state.
- **Beautiful UI**: Styled with TailwindCSS v4 and enhanced with smooth, physics-based toast notifications via Sileo.
