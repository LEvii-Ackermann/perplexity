import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, HumanMessage, SystemMessage, tool, createAgent } from "langchain";
import {ChatMistralAI} from "@langchain/mistralai";
import {TavilySearch} from "@langchain/tavily"
import { sendEmail } from "./mail.service.js";
import * as z from "zod"


//live search tool
const searchTool = new TavilySearch({
  maxResults: 5,
  "name": "search_internet",
  description: "Search the internet for real-time information, news, and current events",
});


//sendEmailTool
const sendingEmailTool = tool(sendEmail, {
  name: "sendEmail",
  description: "A tool to send email ",
  schema: z.object({
    to: z.string().describe("Recipient's email address"),
    subject: z.string().describe("Subject of the email"),
    html: z.string().describe("HTML content of the email"),
  }),
});


//gemini model. Currently not doing anyhting 
const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY
});


//mistral model
const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
  streaming: false
})


//agent created to use the tools
const agent = createAgent({
  model: mistralModel,
  tools: [searchTool, sendingEmailTool],
  systemPrompt:  `
    You are an AI assistant with access to tools.

    IMPORTANT RULES:
    - For any question requiring current information, news, or internet data → ALWAYS use the search tool
    - NEVER make up answers when search is required
    RULES:
    - For news queries → use search tool ONLY ONCE
    - Do NOT call search multiple times
    - Use best possible query in first attempt
    - Then summarize results clearly
`,
})


//main function which is used to generate the responses
export async function generateResponse(messages){
  const formattedMessages = messages
    .map(msg => {
      if(msg.role === "user") return new HumanMessage(msg.content)
      if(msg.role === "ai") return new AIMessage(msg.content)
      return null
    })
    .filter(Boolean) 

  const response = await agent.invoke({
    messages: formattedMessages
  })


  const finalText =
    response.text ||
    response.output ||
    response.messages
    ?.slice()
    .reverse()
    .find(msg => msg.content && msg.content.trim() !== "")
    ?.content ||
    "No response generated"

  return finalText
}


//function to generate the title
export async function generateTitle(message){
    const response = await mistralModel.invoke([
      new SystemMessage(`You are a helpful assistant that generates concise and relevant titles for the given conversations.
        
        User will provide you with the first message of the conversation and you will generate a title for that conversation. The title should be concise, relevant, and should capture the essence of the conversation in 2-3 words.
        `),
        new HumanMessage(`Generate a title for a chat conversation based on the following first message: 
          "${message}"
          `)
    ])

    return response.text
}