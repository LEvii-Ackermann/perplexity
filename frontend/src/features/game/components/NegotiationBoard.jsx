import React, { useState, useRef, useEffect } from "react";
import { useGame } from "../hooks/useGame.js";

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MicIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
)

export default function NegotiationBoard() {
  const {
    product,
    messages,
    loading,
    selectedBuyer,
    selectedSeller,
    handleSendMessage,
  } = useGame();

  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Focus input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll logic for new messages - though in this UI they look floating, 
  // we'll just show the latest message in the bubble for each side, 
  // or show a scrollable list. The screenshot shows floating bubbles.
  // For a clean implementation, let's derive the last user message and last AI message,
  // Or show a chronological floating history.
  // We'll show the last user message on the left (or right) and AI on the right (or left).
  // The layout has Tom (User/Buyer?) on left and Jerry (AI/Seller?) on right.
  // We'll extract the latest message for each role.

  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
  const lastAiMsg = [...messages].reverse().find(m => m.role === "ai");

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    // Optional: detect price in frontend as an 'offer' field or let backend parse it.
    // The backend uses req.body.offer. If it's null, we should try to extract it here to pass.
    let offer = null;
    const matches = msg.match(/\d+/g);
    if (matches) {
       offer = parseInt(matches[matches.length - 1], 10);
    }

    setInput("");
    await handleSendMessage(msg, offer);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#2d2d33] font-sora relative overflow-hidden">
      
      {/* Central Product Image Area */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
         <div className="w-[450px] aspect-video bg-black/40 rounded-xl border border-white/10 flex items-center justify-center flex-col p-4 shadow-2xl relative">
            <span className="text-8xl mb-4">⌨️</span>
            <span className="text-lg text-white/50 lowercase tracking-widest font-mono">Safe work</span>
         </div>
         {/* Item Title Badge */}
         <div className="absolute -bottom-4 right-8 bg-[#2d2110] border border-orange-500/30 px-4 py-1 text-orange-400 font-bold uppercase text-sm shadow-md rounded-sm mt-4 transform rotate-[-2deg]">
            ITEM: {product?.toUpperCase() || "LIMITED ED. MECH KEYBOARD"}
         </div>
      </div>

      {/* Characters and Bubbles Container */}
      <div className="flex-1 flex justify-between items-center px-12 z-10 w-full pt-10">
        
        {/* Left Character (Buyer/User) */}
        <div className="flex flex-col items-center relative w-1/3">
           {lastUserMsg && (
             <div className="absolute bottom-[280px] right-[-100px] bg-white text-black p-4 rounded-xl rounded-bl-sm shadow-xl max-w-xs text-sm font-medium animate-[fadeUp_0.3s_ease_both] border-2 border-red-500/20 z-20">
               <div className="absolute -top-3 right-4 bg-orange-400 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-sm transform rotate-[-5deg]">STUBBORN</div>
               "{lastUserMsg.content}"
               <div className="absolute -bottom-3 left-0 w-0 h-0 border-l-[15px] border-l-white border-b-[15px] border-b-transparent"></div>
             </div>
           )}
           <div className="w-56 h-72 border-4 border-yellow-500 bg-yellow-400/20 flex items-center justify-center -rotate-3 rounded-sm shadow-2xl overflow-hidden relative p-4">
              <span className="text-9xl">{selectedBuyer?.emoji || "🐭"}</span>
           </div>
        </div>

        {/* Right Character (Seller/AI) */}
        <div className="flex flex-col items-center relative w-1/3">
           {lastAiMsg && (
             <div className="absolute bottom-[280px] left-[-100px] bg-white text-black p-4 rounded-xl rounded-br-sm shadow-xl max-w-xs text-sm font-medium animate-[fadeUp_0.3s_ease_both] border-2 border-blue-500/20 z-20">
               "{lastAiMsg.content}"
               <div className="absolute -bottom-3 right-0 w-0 h-0 border-r-[15px] border-r-white border-b-[15px] border-b-transparent"></div>
             </div>
           )}

            {/* AI Loading indicator */}
            {loading && !lastAiMsg && (
             <div className="absolute bottom-[280px] left-[-80px] bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-full flex gap-1 z-20 animate-pulse">
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
             </div>
            )}

           <div className="w-56 h-72 border-4 border-[#0eb7b1] bg-[#0eb7b1]/20 flex items-center justify-center rotate-3 rounded-sm shadow-2xl overflow-hidden relative p-4">
              <span className="text-9xl">{selectedSeller?.emoji || "😼"}</span>
           </div>
        </div>

      </div>

      {/* Bottom Input Area */}
      <div className="h-32 bg-transparent flex justify-center items-end pb-8 z-10 w-full absolute bottom-0">
         <div className="w-full max-w-2xl px-4 relative">
             <div className="absolute -top-3 left-8 bg-yellow-400 text-yellow-950 font-bold px-3 py-0.5 text-xs uppercase z-20">
                 OFFER INPUT
             </div>
             <div className="flex items-center gap-2 bg-[#2d2d31] border-2 border-indigo-400 p-2 shadow-2xl rounded-sm">
                 <button className="bg-red-500 text-white p-3 flex-shrink-0 hover:bg-red-600 transition-colors">
                     <MicIcon />
                 </button>
                 <input 
                    ref={inputRef}
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your offer..."
                    className="flex-1 bg-transparent border-none outline-none text-white px-2 py-2 font-medium"
                    disabled={loading}
                 />
                 <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className={`bg-yellow-400 text-yellow-950 px-6 py-2.5 font-bold flex items-center gap-2 uppercase tracking-wide
                       ${!input.trim() || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-300 transition-colors"}
                    `}
                 >
                     SEND <span className="text-lg leading-none">➔</span>
                 </button>
             </div>
         </div>
      </div>
      
    </div>
  );
}
