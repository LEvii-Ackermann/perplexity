import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  tool,
  createAgent,
} from "langchain";
import { ChatMistralAI } from "@langchain/mistralai";
import { TavilySearch } from "@langchain/tavily";
import { sendEmail } from "./mail.service.js";
import { runCode } from "../tools/codeTool.js";
import { fileSystemTool } from "../tools/fileSystemTool.js";
import * as z from "zod";

//live search tool
const searchTool = new TavilySearch({
  maxResults: 5,
  name: "search_internet",
  description:
    "Search the internet for real-time information, news, and current events",
});

//code execution tool
const codeExecutionTool = tool(runCode, {
  name: "run_code",
  description:
    "Execute code in different programming languages and return output",
  schema: z.object({
    code: z.string().describe("The code to execute"),
    language: z
      .string()
      .describe("Programming language like java, python, javascript, cpp"),
  }),
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

//fileSystemTool
const fileTool = tool(fileSystemTool, {
  name: "file_system",
  description: "Perform file system operations like creating, reading, deleting, renaming, and listing files and folders",
  schema: z.object({
    action: z.enum([
      "create_folder",
      "create_file",
      "read_file",
      "delete_file",
      "delete_folder",
      "list_files",
      "rename",
    ]),
    filePath: z.string().describe("Path of the file or folder"),
    newPath: z.string().optional(),
    content: z.string().optional().describe("Content for file creation"),
  }),
});



//gemini model. Currently not doing anyhting
const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

//mistral model
const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
  streaming: false,
});

//agent created to use the tools
const agent = createAgent({
  model: mistralModel,
  tools: [searchTool, sendingEmailTool, codeExecutionTool, fileTool],
  systemPrompt: `
    You are an AI assistant with access to tools.

    IMPORTANT RULES:
    - For any question requiring current information, news, or internet data → ALWAYS use the search tool
    - NEVER make up answers when search is required

    - If the user provides code (even without explicitly asking to run it) → ALWAYS use the run_code tool
    - If user asks to explain/debug → DO NOT execute
    - Detect the programming language from the code syntax
    - If the language is unclear, assume a reasonable default

    - If the user asks to explain code → DO NOT run it
    - If the user asks to run/execute code → MUST use run_code tool

    - Return ONLY the output from the tool in a clean format
    - Do NOT add explanations like "code executed successfully"
    
    - If the user asks to SEND email, SEND an email using the sendEmail tool

    - If the user asks to create folders or files → ALWAYS use the file_system tool
    - Use "create_folder" for folder creation
    - Use "create_file" for file creation and include content if provided
    - Use "read_file" when user asks to read or open a file
    - Use "delete_file" to delete a file
    - Use "delete_folder" to delete a folder
    - Use "list_files" to list files inside a folder
    - Use "rename" to rename or move files/folders (requires newPath)
    - For delete operations → ALWAYS ask for confirmation before executing

    - Always generate clean relative file paths (e.g., "test/hello.txt")
    - NEVER access paths outside allowed directory

    - Do NOT explain actions, just execute and return result

    RULES:
    - For news queries → use search tool ONLY ONCE
    - Do NOT call search multiple times
    - Use best possible query in first attempt
    - Then summarize results clearly
`,
});

//main function which is used to generate the responses
export async function generateResponse(messages) {
  const formattedMessages = messages
    .map((msg) => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      if (msg.role === "ai") return new AIMessage(msg.content);
      return null;
    })
    .filter(Boolean);

  const response = await agent.invoke({
    messages: formattedMessages,
  });

  const finalText =
    response.text ||
    response.output ||
    response.messages
      ?.slice()
      .reverse()
      .find((msg) => msg.content && msg.content.trim() !== "")?.content ||
    "No response generated";

  return finalText;
}

//function to generate the title
export async function generateTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`You are a helpful assistant that generates concise and relevant titles for the given conversations.
        
        User will provide you with the first message of the conversation and you will generate a title for that conversation. The title should be concise, relevant, and should capture the essence of the conversation in 2-3 words.
        `),
    new HumanMessage(`Generate a title for a chat conversation based on the following first message: 
          "${message}"
          `),
  ]);

  return response.text;
}
