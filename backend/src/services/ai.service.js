import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY
});

export async function testAi() {
    const response = await model.invoke("who is King Kohli?");

    console.log(response.text)
}