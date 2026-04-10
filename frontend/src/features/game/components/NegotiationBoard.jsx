import React, { useState, useRef, useEffect } from "react";
import { useGame } from "../hooks/useGame.js";
import { Navigate } from "react-router";
import keyboardImg from "../../../assets/Keyboard-Background-PNG-Image.webp";

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-mic text-white" >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

export default function NegotiationBoard() {
  const {
    product,
    originalPrice,
    gameId,
    messages,
    loading,
    selectedBuyer,
    selectedSeller,
    handleSendMessage,
  } = useGame();

  if (!product || !originalPrice) {
    return <Navigate to="/game/item-selection" replace />;
  }

  if (!selectedBuyer || !selectedSeller) {
    return <Navigate to="/game/character-selection" replace />;
  }

  if (!gameId) {
    return <Navigate to="/game/character-selection" replace />;
  }

  const [input, setInput] = useState("");
  const [offer, setOffer] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const lastAiMsg = [...messages].reverse().find((m) => m.role === "ai");

const handleSend = async () => {
  if (!input.trim() || !offer) return;

  await handleSendMessage({
    message: input,
    offer: Number(offer), 
  });

  setInput("");
  setOffer("");
};

  const MAX_ROUNDS = 6;
  const currentRound = messages.filter(m => m.role === "user").length;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex flex-col h-screen relative overflow-hidden"
      style={{ background: "#13121f", fontFamily: "'Sora', sans-serif" }}
    >
      <div
        style={{
          position: "absolute",
          top: "20px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "14px",
          zIndex: 20,
        }}
      >
        {Array.from({ length: MAX_ROUNDS }).map((_, i) => {
          const isFilled = i < currentRound;
          const isLast = currentRound === MAX_ROUNDS;

          return (
            <div
              key={i}
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: isFilled ? "#d4920c" : "transparent",
                border: "2px solid #d4920c",
                transition: "all 0.3s ease",
                transform: isFilled ? "scale(1.1)" : "scale(1)",
                animation: isLast ? "shake 0.4s ease-in-out infinite" : "none",
              }}
            />
          );
        })}
      </div>
      {/* ── Central Product Area ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div
          className="flex items-center justify-center flex-col p-4 relative"
          style={{
            width: "400px",
            aspectRatio: "16/9",
            borderRadius: "12px",
            
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] flex items-center justify-center">

            {/* Background keyboard */}
            <img
              src={keyboardImg}
              alt="Product"
              className="absolute w-full h-full object-contain opacity-80 drop-shadow-[0_0_40px_rgba(0,150,255,0.5)]"
            />

          </div>
        </div>
      </div>

      {/* ── Characters Row ── */}
      <div className="flex-1 flex justify-between items-center px-16 z-10 w-full pt-8">

        {/* ── LEFT — Buyer ── */}
        <div className="flex flex-col items-center relative" style={{ width: "220px" }}>

          {/* Speech bubble */}
          {lastUserMsg && (
            <div
              className="absolute z-20 text-sm font-medium"
              style={{
                bottom: "290px",
                right: "-110px",
                background: "#fff",
                color: "#111",
                padding: "12px 14px",
                borderRadius: "12px 12px 2px 12px",
                maxWidth: "220px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                border: "2px solid rgba(234,160,32,0.25)",
                animation: "fadeUp 0.3s ease both",
              }}
            >
              <div
                className="absolute font-bold uppercase"
                style={{
                  top: "-10px",
                  right: "10px",
                  background: "#e8a020",
                  color: "#1a0e00",
                  fontSize: "9px",
                  padding: "2px 7px",
                  borderRadius: "2px",
                  transform: "rotate(-4deg)",
                  letterSpacing: "1px",
                }}
              >
                STUBBORN
              </div>
              <div>
                <div>"{lastUserMsg?.content?.message}"</div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>
                  Offer: ₹{lastUserMsg?.content?.offer}
                </div>
              </div>
              {/* tail */}
              <div style={{
                position: "absolute", bottom: "-12px", left: "0",
                width: 0, height: 0,
                borderLeft: "14px solid #fff",
                borderBottom: "12px solid transparent",
              }} />
            </div>
          )}

          {/* Buyer Character Card */}
          <CharacterCard
            char={selectedBuyer}
            borderColor="#d4920c"
            shadowColor="rgba(212,146,12,0.35)"
            rotate="-3deg"
            label={selectedBuyer?.name || "BUYER"}
            labelBg="#c08000"
          />
        </div>

        {/* ── RIGHT — Seller ── */}
        <div className="flex flex-col items-center relative" style={{ width: "220px" }}>

          {/* Speech bubble */}
          {lastAiMsg && (
            <div
              className="absolute z-20 text-sm font-medium"
              style={{
                bottom: "290px",
                left: "-110px",
                background: "#fff",
                color: "#111",
                padding: "12px 14px",
                borderRadius: "12px 12px 12px 2px",
                maxWidth: "220px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                border: "2px solid rgba(192,48,48,0.2)",
                animation: "fadeUp 0.3s ease both",
              }}
            >
              <div>
                <div>
                  "
                  {typeof lastAiMsg?.content === "string"
                    ? lastAiMsg.content
                    : lastAiMsg?.content?.message}
                  "
                </div>

                {typeof lastAiMsg?.content === "object" && (
                  <div style={{ fontSize: "12px", opacity: 0.7 }}>
                    Offer: ₹{lastAiMsg?.content?.offer}
                  </div>
                )}
              </div>
              <div style={{
                position: "absolute", bottom: "-12px", right: "0",
                width: 0, height: 0,
                borderRight: "14px solid #fff",
                borderBottom: "12px solid transparent",
              }} />
            </div>
          )}

          {/* Loading dots */}
          {loading && !lastAiMsg && (
            <div
              className="absolute z-20 flex gap-1 animate-pulse"
              style={{
                bottom: "290px",
                left: "-70px",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.15)",
                padding: "10px 14px",
                borderRadius: "999px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
              ))}
            </div>
          )}

          {/* Seller Character Card */}
          <CharacterCard
            char={selectedSeller}
            borderColor="#c03030"
            shadowColor="rgba(192,48,48,0.35)"
            rotate="3deg"
            label={selectedSeller?.name || "SELLER"}
            labelBg="#8a1c1c"
          />
        </div>

      </div>

      {/* ── Bottom Input ── */}
<div className="absolute bottom-2 w-full flex justify-center pb-8 z-10">
  <div
    className="relative w-full px-4"
    style={{ maxWidth: "700px" }}
  >

    {/* OFFER LABEL */}
    <div
      style={{
        position: "absolute",
        top: "-12px",
        left: "50px",
        background: "#d4920c",
        color: "#1a0e00",
        fontSize: "11px",
        padding: "3px 12px",
        fontWeight: "bold",
        letterSpacing: "2px",
        borderRadius: "4px",
        transform: "rotate(-3deg)",
        border: "2px solid black",
      }}
    >
      OFFER INPUT
    </div>

    {/* MAIN CONTAINER */}
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        background: "#1a1f3a",
        borderTop: "5px solid #d4920c",
        borderRadius: "10px",
        padding: "14px",
        gap: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
        minHeight: "110px",
      }}
    >

      {/* LEFT - MIC */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          marginBottom: "5px",
        }}
      >
        <button
          style={{
            width: "45px",
            height: "45px",
            background: "#c03030",
            border: "3.5px solid #000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <MicIcon />
        </button>
      </div>

      {/* MIDDLE - TEXT AREA */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        rows={2}
        style={{
          flex: 1,
          resize: "none",
          background: "#0f1328",
          border: "5px solid #f5f5f5",
          borderRadius: "0.2px",
          color: "#fff",
          padding: "12px",
          fontSize: "15px",
          outline: "none",
          lineHeight: "1.4",
        }}
      />

      {/* RIGHT SIDE */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >

        {/* OFFER BOX */}
        <div
          style={{
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#aaa",
            }}
          >
            ₹
          </span>

          <input
            type="number"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            placeholder="Offer"
            style={{
              width: "100px",
              height: "35px",
              paddingLeft: "22px",
              background: "#0f1328",
              border: "3px solid #d4920c",
              color: "#fff",
              borderRadius: "0.2px",
              outline: "none",
              fontWeight: "bold",
            }}
          />
        </div>

        {/* SEND BUTTON */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || !offer || loading}
          style={{
            width: "100px",
            height: "37px",
            background: "#d4920c",
            color: "#1a0e00",
            border: "3px solid black",
            borderRadius: "0.2px",
            fontWeight: "bold",
            cursor:
              !input.trim() || !offer || loading ? "not-allowed" : "pointer",
          }}
        >
          SEND ➔
        </button>
      </div>
    </div>
  </div>
</div>

    </div>
  );
}

/* ── Reusable Character Card ── */
function CharacterCard({ char, borderColor, shadowColor, rotate, label, labelBg }) {
  return (
    <div
      style={{
        width: "200px",
        height: "260px",
        border: `4px solid ${borderColor}`,
        background: "#1c1d35",
        borderRadius: "6px",
        transform: `rotate(${rotate})`,
        boxShadow: `0 8px 32px ${shadowColor}, 0 2px 8px rgba(0,0,0,0.6)`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Image fills the card */}
      <div
        style={{
          flex: 1,
          background: "#1c1d35",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 8px 6px",
        }}
      >
        {char?.img ? (
          <img
            src={char.img}
            alt={char.name}
            style={{ width: "100%", height: "190px", objectFit: "contain" }}
          />
        ) : (
          <span style={{ fontSize: "72px" }}>{char?.emoji || "🐭"}</span>
        )}
      </div>

      {/* Name label at bottom */}
      <div
        style={{
          background: labelBg,
          textAlign: "center",
          color: "#fff",
          fontWeight: 800,
          fontSize: "11px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          padding: "7px 4px",
        }}
      >
        {label}
      </div>
    </div>
  );
}