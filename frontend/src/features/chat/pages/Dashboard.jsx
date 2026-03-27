import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// ── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const ChatIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const BotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" />
    <line x1="12" y1="7" x2="12" y2="11" />
    <line x1="8" y1="15" x2="8" y2="15" strokeWidth="3" />
    <line x1="12" y1="15" x2="12" y2="15" strokeWidth="3" />
    <line x1="16" y1="15" x2="16" y2="15" strokeWidth="3" />
  </svg>
);
const MenuIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1-2 2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

// ── Suggestions ───────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: "✦", label: "Write a Python script", prompt: "Write a Python script to read a CSV file and print a summary of its contents" },
  { icon: "✉", label: "Draft an email", prompt: "Draft a professional email to my team announcing a project deadline extension" },
  { icon: "✎", label: "Summarize an article", prompt: "Summarize the key points of an article I'll paste below" },
  { icon: "⚡", label: "Explain a concept", prompt: "Explain how large language models work in simple terms" },
  { icon: "⊞", label: "Make a to-do list", prompt: "Create a prioritized weekly to-do list for a software developer" },
  { icon: "↗", label: "Research a topic", prompt: "What are the latest trends in artificial intelligence for 2026?" },
];

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0d0d0d;
    --surface: #131313;
    --surface2: #1a1a1a;
    --surface3: #1f1f1f;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --text: #e8e8e8;
    --muted: rgba(255,255,255,0.32);
    --muted2: rgba(255,255,255,0.55);
    --accent: #f97316;
    --accent-dim: rgba(249,115,22,0.12);
    --accent-border: rgba(249,115,22,0.25);
    --radius: 14px;
    font-family: 'Sora', sans-serif;
  }
  html, body, #root { height: 100%; background: var(--bg); color: var(--text); }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

  .chat-item { display:flex; align-items:center; gap:8px; padding:7px 10px; border-radius:9px; cursor:pointer; transition:background 0.15s; color:var(--muted2); font-size:0.78rem; line-height:1.35; }
  .chat-item:hover { background:rgba(255,255,255,0.05); color:var(--text); }
  .chat-item.active { background:rgba(255,255,255,0.07); color:var(--text); }
  .chat-item .chat-title { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .chat-item .del-btn { opacity:0; flex-shrink:0; display:flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:5px; cursor:pointer; transition:opacity 0.15s, background 0.15s; color:var(--muted); background:transparent; border:none; }
  .chat-item:hover .del-btn { opacity:1; }
  .chat-item .del-btn:hover { background:rgba(255,80,80,0.15); color:#ff6b6b; }

  .suggestion-card { display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:10px; border:1px solid var(--border); background:var(--surface2); cursor:pointer; transition:border-color 0.15s, background 0.15s; text-align:left; width:100%; }
  .suggestion-card:hover { border-color:var(--border2); background:var(--surface3); }
  .suggestion-card .s-icon { font-size:0.85rem; color:var(--muted2); flex-shrink:0; width:18px; text-align:center; }
  .suggestion-card .s-label { font-size:0.78rem; color:var(--muted2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  .msg-bot { background:var(--surface2); border:1px solid var(--border); border-radius:16px 16px 16px 4px; padding:14px 18px; }
  .msg-user { background:rgba(255,255,255,0.06); border:1px solid var(--border); border-radius:16px 16px 4px 16px; padding:11px 15px; font-size:0.875rem; line-height:1.72; }
  .avatar { width:27px; height:27px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:600; }
  .avatar-bot { background:var(--accent-dim); color:var(--accent); border:1px solid var(--accent-border); }
  .avatar-user { background:rgba(255,255,255,0.08); color:var(--muted2); border:1px solid var(--border2); }

  .chat-prose p { line-height:1.78; margin-bottom:0.55em; font-size:0.875rem; }
  .chat-prose p:last-child { margin-bottom:0; }
  .msg-user .chat-prose {
    white-space: pre-wrap;
  }
  .chat-prose pre { border-radius:10px; overflow:hidden; margin:0.75em 0; }
  .chat-prose ul,.chat-prose ol { padding-left:1.4em; margin-bottom:0.6em; font-size:0.875rem; line-height:1.78; }
  .chat-prose li { margin-bottom:0.2em; }
  .chat-prose h1,.chat-prose h2,.chat-prose h3 { font-weight:600; margin:0.9em 0 0.4em; }
  .chat-prose table { border-collapse:collapse; width:100%; font-size:0.82rem; margin:0.6em 0; }
  .chat-prose th { background:rgba(255,255,255,0.05); padding:7px 12px; border:1px solid var(--border2); font-weight:500; text-align:left; }
  .chat-prose td { padding:7px 12px; border:1px solid var(--border); }
  .chat-prose tr:nth-child(even) td { background:rgba(255,255,255,0.02); }
  .chat-prose code { font-size:0.8rem; background:rgba(255,255,255,0.08); padding:2px 5px; border-radius:4px; font-family:monospace; }

  .dot { width:5px; height:5px; border-radius:50%; background:var(--muted); animation:blink 1.4s infinite both; display:inline-block; }
  .dot:nth-child(2) { animation-delay:0.2s; }
  .dot:nth-child(3) { animation-delay:0.4s; }
  @keyframes blink { 0%,80%,100%{opacity:0.2;transform:scale(0.85);}40%{opacity:1;transform:scale(1);} }

  .hdr-btn { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:8px; cursor:pointer; background:transparent; border:none; color:var(--muted2); transition:background 0.15s,color 0.15s; }
  .hdr-btn:hover { background:rgba(255,255,255,0.07); color:var(--text); }
  .send-btn { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:8px; cursor:pointer; border:none; transition:background 0.15s; flex-shrink:0; }
  .send-btn:enabled { background:var(--accent); color:#fff; }
  .send-btn:enabled:hover { background:#fb923c; }
  .send-btn:disabled { background:rgba(255,255,255,0.06); color:var(--muted); cursor:not-allowed; }
  .new-chat-btn { display:flex; align-items:center; gap:8px; padding:8px 11px; border-radius:9px; cursor:pointer; font-size:0.78rem; font-weight:500; color:var(--muted2); border:1px solid var(--border); background:transparent; transition:background 0.15s,color 0.15s,border-color 0.15s; width:100%; }
  .new-chat-btn:hover { background:rgba(255,255,255,0.05); color:var(--text); border-color:var(--border2); }

  .input-wrap { border:1px solid var(--border2); border-radius:var(--radius); background:var(--surface2); transition:border-color 0.2s,box-shadow 0.2s; padding:10px 12px; display:flex; align-items:flex-end; gap:10px; }
  .input-wrap:focus-within { border-color:rgba(249,115,22,0.35); box-shadow:0 0 0 3px rgba(249,115,22,0.07); }
  .input-wrap textarea { flex:1; background:transparent; border:none; outline:none; resize:none; color:var(--text); font-family:'Sora',sans-serif; font-size:0.875rem; line-height:1.6; max-height:160px; }
  .input-wrap textarea::placeholder { color:var(--muted); }

  .input-wrap-lg { border:1px solid var(--border2); border-radius:16px; background:var(--surface2); transition:border-color 0.2s,box-shadow 0.2s; padding:14px 16px; display:flex; align-items:flex-end; gap:10px; }
  .input-wrap-lg:focus-within { border-color:rgba(249,115,22,0.35); box-shadow:0 0 0 4px rgba(249,115,22,0.07); }
  .input-wrap-lg textarea { flex:1; background:transparent; border:none; outline:none; resize:none; color:var(--text); font-family:'Sora',sans-serif; font-size:0.95rem; line-height:1.6; max-height:160px; }
  .input-wrap-lg textarea::placeholder { color:var(--muted); }

  .user-profile { display:flex; align-items:center; gap:9px; padding:9px 10px; border-radius:9px; cursor:default; }
  .user-avatar { width:28px; height:28px; border-radius:50%; background:var(--accent-dim); border:1px solid var(--accent-border); color:var(--accent); font-size:0.72rem; font-weight:600; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .logout-btn { margin-left:auto; display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:6px; cursor:pointer; background:transparent; border:none; color:var(--muted); transition:background 0.15s,color 0.15s; flex-shrink:0; }
  .logout-btn:hover { background:rgba(255,80,80,0.12); color:#ff6b6b; }

  .section-label { font-size:0.64rem; font-weight:600; letter-spacing:0.09em; text-transform:uppercase; color:var(--muted); padding:14px 10px 5px; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:translateY(0);} }
  .msg-appear { animation:fadeUp 0.18s ease forwards; }
`;

function StyleInjector() {
  useEffect(() => {
    const id = "naved-styles-v2";

    let el = document.getElementById(id);

    if (!el) {
      el = document.createElement("style");
      el.id = id;
      el.textContent = STYLES;
      document.head.appendChild(el);
    }

    // ✅ CLEANUP (IMPORTANT)
    return () => {
      el.remove();
    };
  }, []);

  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChatDashboard() {
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const textareaRef = useRef(null);
  const lgTextareaRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const lastUserMessageRef = useRef(null);
  const navigate = useNavigate();

  const { handleSendMessage, handleGetChats, initializeSocketConnection, handleGetMessages, handleDeleteChat, handleNewChat } = useChat();
  const { handleLogout } = useAuth();

  const chats = useSelector((s) => s.chat.chats);
  const currentChatId = useSelector((s) => s.chat.currentChatId);
  const loading = useSelector((s) => s.chat.loading);
  const user = useSelector((s) => s.auth?.user);

  const messages = chats[currentChatId]?.messages || [];
  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      lastUserMessageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [messages]);

  useEffect(() => {
    [textareaRef, lgTextareaRef].forEach(ref => {
      const ta = ref.current;
      if (!ta) return;
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    });
  }, [input]);

  useEffect(() => { handleGetChats(); initializeSocketConnection(); }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const messageText = input.trim();
    setInput("");
    await handleSendMessage({ message: messageText, chatId: currentChatId });

    setTimeout(() => {
      lastUserMessageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const fillSuggestion = (prompt) => {
    setInput(prompt);
    setTimeout(() => {
      const ta = lgTextareaRef.current;
      if (ta) { ta.focus(); ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 160) + "px"; }
    }, 0);
  };

  const onLogout = async () => {
    await handleLogout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  const userInitial = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const userName = user?.username || user?.email?.split("@")[0] || "User";

  return (
    <>
      <StyleInjector />
      <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: sidebarOpen ? "240px" : "0",
          minWidth: sidebarOpen ? "240px" : "0",
          overflow: "hidden",
          transition: "width 0.25s cubic-bezier(.4,0,.2,1), min-width 0.25s cubic-bezier(.4,0,.2,1)",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
        }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "11px 16px",
              borderBottom: "1px solid var(--border)",
              height: "53px",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "var(--text)",
            }}
          >
            Naved AI
          </div>
          <div style={{ padding: "16px 12px 1px", flexShrink: 0 }}>
            <button className="new-chat-btn" onClick={handleNewChat}><PlusIcon /> New chat</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 8px" }}>
            {Object.keys(chats).length > 0 && <div className="section-label">Recent</div>}
            {Object.keys(chats).length === 0 && (
              <p style={{ fontSize: "0.73rem", color: "var(--muted)", textAlign: "center", marginTop: "28px" }}>No threads yet</p>
            )}
            {Object.values(chats).map((chat) => (
              <div key={chat.id} className={`chat-item ${chat.id === currentChatId ? "active" : ""}`} onClick={() => handleGetMessages(chat.id)}>
                <span style={{ color: "var(--muted)", flexShrink: 0 }}><ChatIcon /></span>
                <span className="chat-title">{chat.title || "Untitled"}</span>
                <button className="del-btn" onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }} title="Delete"><TrashIcon /></button>
              </div>
            ))}
          </div>

          {/* User profile bottom */}
          <div style={{ padding: "8px 10px 12px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            <div className="user-profile">
              <div className="user-avatar">{userInitial}</div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "500", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
                <div style={{ fontSize: "0.63rem", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email || ""}</div>
              </div>
              <button className="logout-btn" onClick={onLogout} title="Sign out"><LogoutIcon /></button>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Header */}
          <header style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 18px", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg)" }}>
            <button className="hdr-btn" onClick={() => setSidebarOpen(v => !v)} title="Toggle sidebar"><MenuIcon /></button>
            <span style={{ flex: 1, fontSize: "0.8rem", fontWeight: "500", color: "var(--muted2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {hasMessages ? (chats[currentChatId]?.title || "New thread") : "Naved AI"}
            </span>
          </header>

          {/* ── Empty / Welcome State ── */}
          {!hasMessages ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", overflowY: "auto" }}>
              <div style={{ width: "100%", maxWidth: "640px", display: "flex", flexDirection: "column", gap: "24px" }}>

                <div style={{ textAlign: "center" }}>
                  <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: "600", color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                    Ask anything.
                  </h1>
                  <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "8px" }}>
                    Your AI assistant, ready to help.
                  </p>
                </div>

                {/* Large centered input */}
                <div className="input-wrap-lg">
                  <textarea
                    ref={lgTextareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    rows={1}
                  />
                  <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading} style={{ width: "34px", height: "34px" }}>
                    <SendIcon />
                  </button>
                </div>

                {/* Suggestion grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="suggestion-card" onClick={() => fillSuggestion(s.prompt)}>
                      <span className="s-icon">{s.icon}</span>
                      <span className="s-label">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ── Messages ── */}
              <div ref={messagesRef} style={{ flex: 1, overflowY: "auto" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  {messages.map((msg, index) => (
                    <div key={index} className="msg-appear" style={{ display: "flex", gap: "11px", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                      <div className={`avatar ${msg.role === "user" ? "avatar-user" : "avatar-bot"}`}>
                        {msg.role === "user" ? userInitial : <BotIcon />}
                      </div>
                      <div style={{ maxWidth: "calc(100% - 42px)" }}>
                        {msg.role === "user" ? (
                          <div ref={index === messages.length - 1 ? lastUserMessageRef : null} className="msg-user"><div className="chat-prose">{msg.content}</div></div>
                        ) : (
                          <div className="chat-prose" style={{ padding: "4px 0" }}>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              skipHtml={true}
                              components={{
                                p({ children }) {
                                  return <div>{children}</div>;
                                },
                                code({ inline, className, children }) {
                                  const match = /language-(\w+)/.exec(className || "");
                                  const language = match ? match[1] : "javascript";

                                  return !inline ? (
                                    <div style={{ position: "relative" }}>
                                      <button
                                        onClick={() => navigator.clipboard.writeText(children)}
                                        style={{
                                          position: "absolute",
                                          top: "6px",
                                          right: "6px",
                                          background: "rgba(255,255,255,0.08)",
                                          border: "1px solid rgba(255,255,255,0.15)",
                                          borderRadius: "6px",
                                          padding: "4px",
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "#ccc",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                                          e.currentTarget.style.color = "#fff";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                          e.currentTarget.style.color = "#ccc";
                                        }}
                                      >
                                        <CopyIcon />
                                      </button>

                                      <SyntaxHighlighter style={oneDark} language={language}>
                                        {String(children).replace(/\n$/, "")}
                                      </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                        <code
                                          style={{background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem", fontFamily: "monospace",}}
                                        >
                                          {children}
                                        </code>
                                      );
                                },
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {loading && (
                    <div className="msg-appear" style={{ display: "flex", gap: "11px", alignItems: "flex-start" }}>
                      <div className="avatar avatar-bot"><BotIcon /></div>
                      <div className="msg-bot" style={{ display: "flex", gap: "5px", alignItems: "center", padding: "14px 16px" }}>
                        <div className="dot" /><div className="dot" /><div className="dot" />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>

              {/* ── Bottom Input ── */}
              <div style={{ padding: "12px 24px 18px", flexShrink: 0, background: "var(--bg)" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                  <div className="input-wrap">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask anything..."
                      rows={1}
                    />
                    <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading}><SendIcon /></button>
                  </div>
                  <p style={{ fontSize: "0.63rem", color: "var(--muted)", textAlign: "center", marginTop: "6px", opacity: 0.55 }}>
                    Enter to send · Shift+Enter for new line
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
