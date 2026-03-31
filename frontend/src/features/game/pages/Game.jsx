import { useState, useRef, useEffect } from "react"
import { useGame } from "../hooks/useGame.js"

// ── Icons (same as Dashboard) ─────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)
const BotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" />
    <line x1="12" y1="7" x2="12" y2="11" />
    <line x1="8" y1="15" x2="8" y2="15" strokeWidth="3" />
    <line x1="12" y1="15" x2="12" y2="15" strokeWidth="3" />
    <line x1="16" y1="15" x2="16" y2="15" strokeWidth="3" />
  </svg>
)

// ── Items to bargain ───────────────────────────────────────────────────────────
const ITEMS = [
  { emoji: "📱", name: "Smartphone",    originalPrice: 15000 },
  { emoji: "👟", name: "Sneakers",      originalPrice: 3500  },
  { emoji: "🎧", name: "Headphones",    originalPrice: 4000  },
  { emoji: "⌚", name: "Watch",         originalPrice: 8000  },
  { emoji: "👜", name: "Leather Bag",   originalPrice: 2500  },
  { emoji: "🕶️", name: "Sunglasses",    originalPrice: 1200  },
]

// ── Styles ────────────────────────────────────────────────────────────────────
const GAME_STYLES = `
  .item-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 22px 16px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.07);
    background: #131313;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, transform 0.15s;
    text-align: center;
  }
  .item-card:hover {
    border-color: rgba(249,115,22,0.4);
    background: #1a1a1a;
    transform: translateY(-2px);
  }
  .item-card .item-emoji { font-size: 2rem; }
  .item-card .item-name  { font-size: 0.8rem; color: rgba(255,255,255,0.7); font-weight: 500; }
  .item-card .item-price { font-size: 0.72rem; color: rgba(255,255,255,0.35); }

  .score-card {
    background: rgba(249,115,22,0.08);
    border: 1px solid rgba(249,115,22,0.25);
    border-radius: 14px;
    padding: 20px 24px;
    text-align: center;
    max-width: 340px;
    margin: 0 auto;
  }

  .game-msg-appear { animation: fadeUp 0.2s ease both; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
`

export default function Game() {
  const {
    gameId,
    product,
    originalPrice,
    messages,
    status,
    scoreCard,
    loading,
    handleStartGame,
    handleSendMessage,
    handleResetGame,
  } = useGame()

  const [input, setInput] = useState("")
  const textareaRef = useRef(null)
  const bottomRef   = useRef(null)
  const messagesRef = useRef(null)

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px"
  }, [input])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || loading || status !== "ongoing") return
    setInput("")
    await handleSendMessage(msg)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isGameOver = status === "completed" || status === "failed"

  // ── Phase 1: Item selection ───────────────────────────────────────────────
  if (!gameId) {
    return (
      <>
        <style>{GAME_STYLES}</style>
        <div style={{
          minHeight: "100vh",
          background: "#0d0d0d",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          fontFamily: "'Sora', sans-serif",
        }}>
          <div style={{ marginBottom: "8px", fontSize: "0.72rem", color: "rgba(249,115,22,0.8)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
            Bargain Mode
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600, color: "#e8e8e8", marginBottom: "8px", textAlign: "center" }}>
            Pick something to bargain
          </h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", marginBottom: "36px", textAlign: "center" }}>
            Outsmart the shopkeeper. Get the best deal.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", maxWidth: "500px", width: "100%" }}>
            {ITEMS.map((item) => (
              <button
                key={item.name}
                className="item-card"
                onClick={() => handleStartGame({ product: item.name, originalPrice: item.originalPrice })}
                disabled={loading}
              >
                <span className="item-emoji">{item.emoji}</span>
                <span className="item-name">{item.name}</span>
                <span className="item-price">₹{item.originalPrice.toLocaleString("en-IN")}</span>
              </button>
            ))}
          </div>
        </div>
      </>
    )
  }

  // ── Phase 2: Chat (reuses Dashboard chat UI pattern) ─────────────────────
  return (
    <>
      <style>{GAME_STYLES}</style>
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0d0d0d",
        fontFamily: "'Sora', sans-serif",
        color: "#e8e8e8",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>
              {ITEMS.find(i => i.name === product)?.emoji ?? "🛍️"}
            </span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{product}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>
                MRP ₹{originalPrice?.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
          <button
            onClick={handleResetGame}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.45)",
              borderRadius: "8px",
              padding: "5px 12px",
              fontSize: "0.72rem",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#e8e8e8" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)" }}
          >
            ← Change item
          </button>
        </div>

        {/* Messages */}
        <div ref={messagesRef} style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px 0", display: "flex", flexDirection: "column", gap: "16px" }}>

            {messages.map((msg, i) => (
              <div
                key={i}
                className="game-msg-appear"
                style={{
                  display: "flex",
                  gap: "10px",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "27px", height: "27px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: msg.role === "ai" ? "0.85rem" : "0.7rem", fontWeight: 600,
                  background: msg.role === "ai" ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.08)",
                  color:      msg.role === "ai" ? "#f97316"               : "rgba(255,255,255,0.55)",
                  border:     msg.role === "ai" ? "1px solid rgba(249,115,22,0.25)" : "1px solid rgba(255,255,255,0.12)",
                }}>
                  {msg.role === "ai"
                    ? (ITEMS.find(i => i.name === product)?.emoji ?? "🧑‍💼")
                    : "U"}
                </div>

                {/* Bubble */}
                <div style={{ maxWidth: "calc(100% - 40px)", fontSize: "0.875rem", lineHeight: "1.7" }}>
                  {msg.role === "user" ? (
                    <div style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px 16px 4px 16px",
                      padding: "10px 14px",
                      whiteSpace: "pre-wrap",
                    }}>
                      {msg.content}
                    </div>
                  ) : (
                    <div style={{
                      background: "#131313",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "16px 16px 16px 4px",
                      padding: "12px 16px",
                    }}>
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading dots — same as Dashboard */}
            {loading && (
              <div className="game-msg-appear" style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{
                  width: "27px", height: "27px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem",
                  background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)",
                }}>
                  {ITEMS.find(i => i.name === product)?.emoji ?? "🧑‍💼"}
                </div>
                <div style={{
                  background: "#131313", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "16px 16px 16px 4px", padding: "14px 16px",
                  display: "flex", gap: "5px", alignItems: "center",
                }}>
                  {[0, 0.2, 0.4].map((delay, idx) => (
                    <span key={idx} style={{
                      width: "5px", height: "5px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.3)", display: "inline-block",
                      animation: `blink 1.4s ${delay}s infinite both`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Game Over — Score card */}
            {isGameOver && !loading && (
              <div className="game-msg-appear score-card">
                {status === "completed" && scoreCard ? (
                  <>
                    <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>🤝</div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#f97316", marginBottom: "4px" }}>
                      Deal Done!
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "16px" }}>
                      You got {product} for ₹{scoreCard.finalPrice?.toLocaleString("en-IN")}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "20px" }}>
                      <div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e8e8e8" }}>{scoreCard.score}</div>
                        <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>Score</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f97316" }}>
                          ₹{(scoreCard.originalPrice - scoreCard.finalPrice)?.toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>Saved</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>😑</div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#e8e8e8", marginBottom: "4px" }}>
                      Deal Cancelled
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>
                      Better luck next time
                    </div>
                  </>
                )}
                <button
                  onClick={handleResetGame}
                  style={{
                    background: "rgba(249,115,22,0.15)",
                    border: "1px solid rgba(249,115,22,0.3)",
                    color: "#f97316",
                    borderRadius: "9px",
                    padding: "8px 20px",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                >
                  Try another item →
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input — same structure as Dashboard */}
        <div style={{ padding: "12px 24px 18px", flexShrink: 0, background: "#0d0d0d" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: "8px",
              background: "#131313",
              border: `1px solid ${isGameOver ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "12px",
              padding: "10px 12px",
              opacity: isGameOver ? 0.4 : 1,
              transition: "border-color 0.15s",
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isGameOver ? "Game over" : "Make an offer... e.g. ₹2000"}
                disabled={isGameOver || loading}
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#e8e8e8", resize: "none", fontFamily: "inherit",
                  fontSize: "0.875rem", lineHeight: "1.6", maxHeight: "140px",
                  overflowY: "auto",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || isGameOver}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "30px", height: "30px", borderRadius: "8px", flexShrink: 0,
                  background: input.trim() && !loading && !isGameOver ? "#f97316" : "rgba(255,255,255,0.06)",
                  border: "none", cursor: input.trim() && !loading && !isGameOver ? "pointer" : "default",
                  color: input.trim() && !loading && !isGameOver ? "#fff" : "rgba(255,255,255,0.2)",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <SendIcon />
              </button>
            </div>
            <p style={{ fontSize: "0.63rem", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "6px" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,80%,100%{opacity:0.2;transform:scale(0.85);}40%{opacity:1;transform:scale(1);} }
      `}</style>
    </>
  )
}