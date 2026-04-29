# ModelVerse AI

**ModelVerse AI** is a comprehensive, production-ready full-stack AI chatbot platform. It integrates advanced Large Language Models (LLMs) such as Google Gemini and Mistral AI, delivering real-time streaming responses, persistent chat history, and seamless authentication. The application is built with modern, industry-standard technologies to ensure high performance, scalability, and an intuitive user experience.

---

## ✨ Features

- **Real-Time AI Streaming**: Utilizes **Socket.IO** for low-latency, real-time token streaming directly from the AI models, providing a highly responsive chatbot experience similar to ChatGPT.
- **Multiple LLM Integrations**: Seamlessly integrated with **LangChain**, allowing flexible switching and interaction with models from **Google GenAI** and **MistralAI**.
- **Secure Authentication System**: Robust user authentication workflow including login, signup, secure cookie-based session management, and email verification using **JWT (JSON Web Tokens)** and **Nodemailer**.
- **Persistent Chat History & Message Storage**: User conversations are stored securely using **MongoDB** and **Mongoose**, allowing users to revisit past chats with organized titles and sessions.
- **Internet Research Capabilities**: Advanced chat features utilizing LangChain to incorporate dynamic real-world data into the AI's knowledge.
- **Modern User Interface**: A beautifully designed, highly responsive frontend built with **React**, **Vite**, and **TailwindCSS**, optimized with **Redux Toolkit** for centralized state management.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19, Vite
- **State Management**: Redux Toolkit (RTK)
- **Styling**: TailwindCSS v4
- **Routing**: React Router DOM v7
- **Real-time Communication**: Socket.io-client
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **AI Integration**: LangChain (`@langchain/google-genai`, `@langchain/mistralai`)
- **Real-time Engine**: Socket.IO
- **Authentication**: JWT, bcryptjs, cookie-parser
- **Email Services**: Nodemailer

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ModelVerse-AI
```

### 2. Backend Setup

Navigate to the backend directory, install dependencies, and configure environment variables.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory based on the following template:

```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret

# Email Configuration (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# AI Model API Keys
GOOGLE_API_KEY=your_google_gemini_api_key
MISTRAL_API_KEY=your_mistral_api_key
```

Start the backend development server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal window, navigate to the frontend directory, install dependencies, and run the development server.

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.

---

## 🏗️ System Architecture

- **Client-Side Rendering (CSR)**: The React frontend handles all UI rendering, interacting with the backend via RESTful APIs for CRUD operations and WebSockets for real-time streaming.
- **REST API + WebSockets**: The backend exposes Express routes for authentication, user management, and chat history retrieval. For active AI conversations, it establishes a persistent Socket.IO connection.
- **AI Pipeline (LangChain)**: Upon receiving a user prompt, the backend utilizes LangChain to structure the query, interact with the selected LLM (Google Gemini or Mistral), and stream the generated tokens back to the client via Socket.IO.

---

## 🌍 Deployment

- **Frontend**: Deployed on **Vercel** with client-side routing configured via Vite plugins and Vercel framework presets.
- **Backend**: Deployed on **Render**, utilizing environment variable management to switch gracefully between development (`localhost`) and production environments. MongoDB is hosted on **MongoDB Atlas**.

_(Ensure your deployment URLs are properly configured in both the frontend and backend environment variables to prevent CORS or authentication failures.)_

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
