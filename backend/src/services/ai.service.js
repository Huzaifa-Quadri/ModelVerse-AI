import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "langchain";
import { ChatMistralAI } from "@langchain/mistralai";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "models/gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function generateResponse(message) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment");
    }

    const response = await geminiModel.invoke([new HumanMessage(message)]);
    return response.content || response.text;
  } catch (error) {
    console.error("❌ AI Generation Error:", error.message);
    throw error;
  }
}

export async function generateTitle(message) {
  try {
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error("MISTRAL_API_KEY is not set in environment");
    }

    const response = await mistralModel.invoke([
      new SystemMessage(`You are a helpful assistant that generates concise and catchy titles for the chat conversations. 
        User will provide you with first message of the conversation and you will generate a title based on that. The title should be relevant to the content of the conversation and should be engaging to attract users. Please keep the title short and to the point, giving users a clear idea of what the conversation is about.
      `),
      new HumanMessage(
        `Please provide a title that captures the essence of the given message: "${message}"`,
      ),
    ]);
    return response.content || response.text;
  } catch (error) {
    console.error("❌ AI Generation Error:", error.message);
    throw error;
  }
}
