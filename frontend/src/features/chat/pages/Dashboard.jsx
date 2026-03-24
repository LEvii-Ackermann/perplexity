import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat.js";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Icons
const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const SendIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const ChatIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const BotIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <line x1="12" y1="7" x2="12" y2="11" />
    <line x1="8" y1="15" x2="8" y2="15" strokeWidth="3" />
    <line x1="12" y1="15" x2="12" y2="15" strokeWidth="3" />
    <line x1="16" y1="15" x2="16" y2="15" strokeWidth="3" />
  </svg>
);
const UserIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const MenuIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// Render markdown-ish bold text
function renderContent(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}
export default function ChatDashboard() {
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  const { handleSendMessage, handleGetChats, initializeSocketConnection, handleGetMessages, handleDeleteChat, handleNewChat } = useChat();

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const loading = useSelector((state) => state.chat.loading);

  // ✅ FIX: messages from redux
  const messages = chats[currentChatId]?.messages || [];

  // scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // textarea resize
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  useEffect(() => {
    handleGetChats()
    initializeSocketConnection()
  }, [])

  // send message
  const handleSend = async (e) => {
    if (!input.trim() || loading) return;

    const messageText = input.trim();

    const newChatId = await handleSendMessage({
    message: messageText,
    chatId: currentChatId,
  });

    setInput("");
  };

  const openChat = (chatId) => {
    handleGetMessages(chatId)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeChat = (chatId) => {
    handleDeleteChat(chatId)
  }

  return (
    <div className="flex h-screen bg-[#121212] text-white">
      {/* Sidebar */}
      <aside
        className={`flex flex-col transition-all ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} bg-[#161616]`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
          <span className="text-sm font-semibold text-white/80">Naved AI</span>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2">
          {Object.keys(chats).length === 0 && (
            <p className="text-xs text-white/30 text-center mt-8">
              No chats yet
            </p>
          )}

          {Object.values(chats).map((chat) => (
            <div key={chat.id} className="flex px-3 cursor-pointer py-2 text-sm text-white/60" onClick={() => {openChat(chat.id)}}>
              <ChatIcon /> {chat.title} 
              <button onClick={(e) => {
                e.stopPropagation();
                removeChat(chat.id);
              }}>
                <TrashIcon />
              </button>

            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <button onClick={() => setSidebarOpen((v) => !v)}>
            <MenuIcon />
          </button>
          <span className="text-sm text-white/40">
            {chats[currentChatId]?.title || "New Chat"}
          </span>
          <button onClick={handleNewChat}>
            <PlusIcon />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/20">
              Ask me anything
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center">
                    {msg.role === "user" ? "N" : <BotIcon />}
                  </div>

                  <div className="bg-[#1e1e1e] px-4 py-3 rounded-2xl text-sm prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

              {loading && <div className="text-white/40">Typing...</div>}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-5 pt-3">
          <div className="max-w-2xl mx-auto flex gap-2 bg-[#1a1a1a] p-3 rounded-2xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none resize-none"
              placeholder="Ask anything..."
            />
            <button onClick={handleSend} disabled={!input.trim() || loading}>
              <SendIcon />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
