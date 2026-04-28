import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "langchain";
import { ChatMistralAI } from "@langchain/mistralai";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "models/gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function generateResponse(messages) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment");
    }

    // const response = await geminiModel.invoke([new HumanMessage(message)]);
    const response = await geminiModel.invoke(
      messages.map((msg) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        } else if (msg.role === "assistant") {
          return new AIMessage(msg.content);
        }
        return new SystemMessage(msg.content);
      }),
    );
    return response.content || response.text;
  } catch (error) {
    console.error("❌ AI Generation Error:", error.message);
    throw error;
  }
}

// ============================================
// STREAMING VERSION — Used by Socket.IO
// ============================================
//
// Instead of waiting for the entire AI response (like generateResponse does),
// this function streams tokens one-by-one as Gemini generates them.
//
// How it works:
//   1. geminiModel.stream() returns an async iterator (like a conveyor belt of tokens)
//   2. We loop through each token with `for await...of`
//   3. For each token, we call the `onToken` callback → socket handler emits it to the client
//   4. We also accumulate all tokens into `fullContent` so we can save the complete response to DB
//   5. If the user clicks "Stop Generating", the AbortSignal fires and we break out of the loop
//
// Parameters:
//   - messages: Array of { role, content } objects (the full conversation history)
//   - onToken:  Callback function called with each text chunk, e.g., onToken("Hello") → onToken(" world")
//   - signal:   AbortSignal from an AbortController — allows cancellation mid-stream
//
// Returns: The full accumulated AI response string (for saving to DB)

export async function generateStreamingResponse(messages, onToken, signal) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment");
    }

    // ── Convert our DB message format to LangChain message objects ──
    // Same conversion as generateResponse, but used with .stream() instead of .invoke()
    const langchainMessages = messages.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "assistant") {
        return new AIMessage(msg.content);
      }
      return new SystemMessage(msg.content);
    });

    // ── Start the stream ──
    // .stream() returns an async iterable — each iteration yields one chunk/token
    // This is the KEY difference from .invoke() which waits for the complete response
    const stream = await geminiModel.stream(langchainMessages);

    // ── Accumulate the full response ──
    // We need the complete text to save to MongoDB after streaming finishes
    let fullContent = "";

    // ── Process each token as it arrives ──
    for await (const chunk of stream) {
      // Check if the user cancelled (clicked "Stop Generating")
      // AbortSignal.aborted becomes true when AbortController.abort() is called
      if (signal?.aborted) {
        console.log("🛑 AI generation was cancelled by user");
        break; // Stop reading from the stream
      }

      // chunk.content contains the actual text token from Gemini
      // e.g., "Hello", " how", " are", " you", "?" — each comes separately
      const token = chunk.content;

      if (token) {
        fullContent += token; // Build up the complete response
        onToken(token); // Send this token to the client immediately via socket
      }
    }

    return fullContent; // Return complete text for DB storage
  } catch (error) {
    // If the error is from cancellation, don't treat it as a real error
    if (error.name === "AbortError") {
      console.log("🛑 Stream aborted");
      return ""; // Return empty — the partial content was already sent via onToken
    }
    console.error("❌ AI Streaming Error:", error.message);
    throw error;
  }
}

export async function generateChatMetadata(message) {
  try {
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error("MISTRAL_API_KEY is not set in environment");
    }

    const response = await mistralModel.invoke([
      new SystemMessage(`You are a helpful assistant that generates concise and catchy titles for chat conversations and classifies their topics.
      User will provide you with first message of the conversation and you will generate a title and choose a topic based on that. The title should be relevant to the content of the conversation and should be engaging to attract users. Please keep the title short and to the point, giving users a clear idea of what the conversation is about.
      
      Topics must be one of: "general", "search", "technical", "creative", "other".
      
      - "general": Everyday conversations, casual talk, or miscellaneous topics.
      - "search": Questions about finding information, research, or queries.
      - "technical": Programming, development, tools, or technical problems.
      - "creative": Writing, art, design, brainstorming, or creative tasks.
      - "other": Anything that doesn't fit the above categories.
      
      Respond with a JSON object in this exact format:
      {"title": "Your catchy title here", "topic": "chosen_topic"}`),
      new HumanMessage(
        `Analyze this message and provide a title and topic: "${message}"`,
      ),
    ]);

    const result = JSON.parse(response.content || response.text);
    return {
      title: result.title || "Untitled Chat",
      topic: result.topic || "general", // Fallback to "general" if parsing fails
    };
  } catch (error) {
    console.error("❌ AI Metadata Generation Error:", error.message);
    // Fallback values
    return {
      title: "Untitled Chat",
      topic: "general",
    };
  }
}
