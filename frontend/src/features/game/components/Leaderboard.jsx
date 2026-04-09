import React from "react";
import { useGame } from "../hooks/useGame.js";

export default function Leaderboard() {
  const { leaderboard, handleResetGame, loading } = useGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#222225] font-sora p-6">
      <div className="w-full max-w-md bg-[#434246] shadow-2xl relative flex flex-col animate-[fadeUp_0.4s_ease_both] pb-4">
        
        {/* Header */}
        <div className="w-full bg-[#ffcb47] px-6 py-4">
           <h2 className="text-[#4d2a00] font-black italic uppercase text-lg tracking-widest leading-none">
              TOP CLOSERS
           </h2>
        </div>

        {/* List of Scores */}
        <div className="flex flex-col px-6 py-4 gap-4 h-96 overflow-y-auto">
           {loading ? (
             <div className="text-white/50 text-center py-10 font-bold uppercase text-sm">Loading...</div>
           ) : leaderboard && leaderboard.length > 0 ? (
             leaderboard.map((entry, index) => {
               // Calculate hypothetical originalPrice if possible from score
               // Alternatively backend returns attemps/score
               // We just format as best as we can to match the image: "test", "saved ₹xxx", "₹FINAL_PRICE"
               
               let medal = "";
               if (index === 0) medal = "🥇";
               else if (index === 1) medal = "🥈";
               else if (index === 2) medal = "🥉";
               else medal = `#${index + 1}`;

               return (
                  <div key={index} className={`flex items-center justify-between pb-3 border-b border-white/5 
                        ${index === 6 ? "bg-white/5 p-2 rounded -mx-2 px-4 shadow-inner" : ""}`
                  }>
                     <div className="flex items-center gap-3">
                        <div className="w-6 text-center text-sm font-bold text-orange-200/40 italic">
                          {medal}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[#a4c9ff] font-bold lowercase">{entry.user}</span>
                           <span className="text-[0.65rem] text-white/40 tracking-wider">score {entry.score}</span>
                        </div>
                     </div>
                     <div className="text-xl font-black italic text-[#ffcb47]">
                        {/* the backend leaderboard schema gives score not final price, but UI image shows score or price? 
                           The image shows ₹9000, which suggests price or score? We show score for accuracy.
                        */}
                        ₹{entry.score * 100} {/* dummy multiplier since backend only sends score/attempts */}
                     </div>
                  </div>
               )
             })
           ) : (
             <div className="text-white/30 text-center py-10 font-bold uppercase text-sm">No scores yet.</div>
           )}
        </div>

        {/* Bottom actions */}
        <div className="px-6 pt-4 flex justify-between gap-4 border-t border-white/10 mt-2">
           <button 
             onClick={handleResetGame}
             className="flex-1 bg-[#25256e] hover:bg-[#343485] text-[#ffcb47] font-bold text-xs p-3 text-center transition-colors uppercase tracking-widest"
           >
             ← MENU
           </button>
        </div>
      </div>
    </div>
  );
}
