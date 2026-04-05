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
