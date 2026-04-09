import React from "react";
import { useGame } from "../hooks/useGame.js";

export default function ScoreBoard() {
  const { scoreCard, status, handleFetchLeaderboard, handleResetGame, selectedBuyer, selectedSeller } = useGame();

  const isSuccess = status === "completed";

  // Calculate discount percentage if scoreCard available
  let discountPercent = 0;
  if (scoreCard && scoreCard.originalPrice) {
      discountPercent = Math.round(((scoreCard.originalPrice - scoreCard.finalPrice) / scoreCard.originalPrice) * 100);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#222225] font-sora p-6">
      
      {/* Top character avatars - Small floating icons */}
      <div className="flex justify-center gap-8 mb-10 w-full max-w-sm">
        <div className="w-16 h-20 border-2 border-yellow-500 bg-yellow-400/20 flex flex-col justify-center items-center shadow-lg -rotate-6">
           <span className="text-3xl">{selectedBuyer?.emoji || "🐭"}</span>
        </div>
        <div className="w-16 h-20 border-2 border-[#0eb7b1] bg-[#0eb7b1]/20 flex flex-col justify-center items-center shadow-lg rotate-6">
           <span className="text-3xl">{selectedSeller?.emoji || "😼"}</span>
        </div>
      </div>

      <div className="w-full max-w-xl animate-[fadeUp_0.4s_ease_both]">
        {isSuccess ? (
          <div className="bg-[#ffcb47] text-[#4d2a00] p-6 shadow-2xl relative flex flex-col items-center justify-center">
             <h1 className="text-4xl font-black italic uppercase tracking-wider mb-6 text-center shadow-text-custom">DEAL SECURED!</h1>
             
             <div className="flex gap-4 w-full">
                {/* Final Price Block */}
                <div className="flex-1 bg-[#1c1a17] text-white p-3 flex flex-col text-center shadow-inner pt-4">
                   <span className="text-[0.6rem] font-bold text-orange-400 uppercase tracking-widest mb-1 leading-none">Final Price</span>
                   <span className="text-3xl font-black italic text-[#ffc844]">₹{scoreCard?.finalPrice?.toLocaleString("en-IN") || 0}</span>
                </div>

                {/* You Saved Block */}
                <div className="flex-1 bg-white text-black p-3 flex flex-col text-center border-2 border-green-500 shadow-inner pt-4">
                   <span className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest mb-1 leading-none">You Saved</span>
                   <span className="text-3xl font-black italic text-green-500">
                     ₹{(scoreCard?.originalPrice - scoreCard?.finalPrice)?.toLocaleString("en-IN") || 0}
                   </span>
                </div>

                {/* Discount Block */}
                <div className="flex-1 bg-[#d5f6ff] text-[#0f5c7b] p-3 flex flex-col text-center border-2 border-[#54b4d3] shadow-inner pt-4">
                   <span className="text-[0.6rem] font-bold text-[#0f5c7b]/60 uppercase tracking-widest mb-1 leading-none">Discount</span>
                   <span className="text-3xl font-black italic text-[#0f5c7b]">{discountPercent}% OFF</span>
                </div>
             </div>
             
             {/* Note to User requested by instructions */}
             <div className="mt-4 text-[0.65rem] opacity-70 font-bold uppercase tracking-widest">
                * Score automatically linked to your account profile
             </div>
          </div>
        ) : (
          <div className="bg-[#2d2d31] border-2 border-red-500/50 text-white p-6 shadow-2xl relative flex flex-col items-center justify-center">
             <h1 className="text-4xl font-black italic uppercase tracking-wider mb-6 text-center text-red-500">DEAL CANCELLED</h1>
             <p className="text-gray-400 font-medium">Bargaining failed. You didn't secure a good price.</p>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-4 items-center">
            <button 
               onClick={handleFetchLeaderboard}
               className="bg-[#25256e] hover:bg-[#343485] text-[#ffcb47] px-8 py-3 w-3/4 text-center font-bold italic tracking-widest uppercase transition-colors"
            >
               LOADING SCORES...
            </button>

            <button 
               onClick={handleResetGame}
               className="bg-[#ffcb47] hover:bg-[#fbd366] text-[#4d2a00] px-8 py-3 w-1/2 text-center font-bold uppercase transition-colors flex justify-center items-center gap-2"
            >
               <span className="text-xl leading-none">↺</span> PLAY AGAIN
            </button>
        </div>
      </div>
    </div>
  );
}
