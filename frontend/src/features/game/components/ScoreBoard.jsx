import React from "react";
import { useGame } from "../hooks/useGame.js";
import { Navigate } from "react-router";
import { useEffect } from "react";

export default function ScoreBoard() {
  const {
    scoreCard,
    latestScore,
    userRank,
    status,
    handleFetchLeaderboard,
    handleFetchLatestScore,
    handleFetchUserRank,
    handleResetGame,
    selectedBuyer,
    selectedSeller,
  } = useGame();

  if (!selectedBuyer || !selectedSeller) {
    return <Navigate to="/game/character-selection" replace />;
  }

  if (status !== "completed" && status !== "failed") {
    return <Navigate to="/game/negotiation" replace />;
  }

  useEffect(() => {
    if (!latestScore) {
      handleFetchLatestScore();
    }
    if (!userRank) {
      handleFetchUserRank();
    }
  }, []);

  const effectiveScore = scoreCard || latestScore;
  const isSuccess = status === "completed";
  const discountPercent = effectiveScore?.originalPrice
    ? Math.round(((effectiveScore.originalPrice - effectiveScore.finalPrice) / effectiveScore.originalPrice) * 100)
    : 0;
  const saved = (effectiveScore?.originalPrice || 0) - (effectiveScore?.finalPrice || 0);
  const scoreVal = effectiveScore?.score || 0;
  const scoreBarWidth = `${scoreVal}%`;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 py-10"
      style={{ background: "#0a0a0a", fontFamily: "'Noto Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans:wght@400;700&display=swap');
        .bebas { font-family: 'Bebas Neue', sans-serif; }
        .stripe::before { content:''; position:absolute; inset:0; pointer-events:none;
          background: repeating-linear-gradient(-55deg, transparent, transparent 40px, rgba(255,200,0,0.015) 40px, rgba(255,200,0,0.015) 41px); }
        .btn-primary:hover { transform: translate(-2px,-2px) !important; box-shadow: 6px 6px 0 #e63c2f !important; }
        .btn-primary:active { transform: translate(2px,2px) !important; box-shadow: 2px 2px 0 #e63c2f !important; }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.3) !important; color: #fff !important; }
      `}</style>

      <div className="stripe absolute inset-0 pointer-events-none" />

      {/* Characters */}
      <div className="relative z-10 flex items-center gap-6 mb-9">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-20 h-24 flex items-center justify-center"
            style={{ border: "2px solid #ffc800", background: "rgba(255,200,0,0.08)", transform: "rotate(-4deg)" }}>
            {selectedBuyer?.img ? (
              <img
                src={selectedBuyer.img}
                alt={selectedBuyer.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-5xl">🐭</span>
            )}
          </div>
          <span className="bebas text-[0.55rem] tracking-[4px] text-yellow-400/50 uppercase">You</span>
        </div>
        <span className="bebas text-[2rem] tracking-[4px] text-white/15">VS</span>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-20 h-24 flex items-center justify-center"
            style={{ border: "2px solid #e63c2f", background: "rgba(230,60,47,0.08)", transform: "rotate(4deg)" }}>
            {selectedSeller?.img ? (
              <img
                src={selectedSeller.img}
                alt={selectedSeller.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-5xl">😼</span>
            )}
          </div>
          <span className="bebas text-[0.55rem] tracking-[4px] uppercase" style={{ color: "rgba(230,60,47,0.5)" }}>AI Seller</span>
        </div>
      </div>

      {/* Result Banner */}
      <div className="relative z-10 w-full max-w-xl flex items-center justify-center mb-9 px-8 py-2.5"
        style={{
          background: isSuccess ? "#ffc800" : "#e63c2f",
          transform: "rotate(-1deg)",
          boxShadow: isSuccess ? "5px 5px 0 #e63c2f" : "5px 5px 0 #ffc800"
        }}>
        <span className="bebas text-[2.2rem] tracking-[4px]" style={{ color: isSuccess ? "#0a0a0a" : "#fff" }}>
          {isSuccess ? "DEAL SECURED!" : "DEAL CANCELLED"}
        </span>
      </div>

      {/* Score Hero */}
      <div className="relative z-10 w-full max-w-xl mb-0.5"
        style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex flex-col items-center justify-center px-6 py-7 relative">
          <span className="bebas text-[0.5rem] tracking-[5px] text-white/25 absolute top-3">YOUR SCORE</span>
          <div className="flex items-end gap-1">
            <span className="bebas leading-none text-yellow-400" style={{ fontSize: "7rem", letterSpacing: "-2px" }}>
              {scoreVal}
            </span>
            <span className="bebas text-[2rem] text-yellow-400/30 mb-3">/100</span>
          </div>
          <div className="w-48 h-1 rounded-full mt-2" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-1 rounded-full" style={{ width: scoreBarWidth, background: "#ffc800" }} />
          </div>
          {userRank?.rank && (
            <p className="bebas text-[0.7rem] tracking-[3px] text-white/40 uppercase mt-3">
              Current Rank: #{userRank.rank} / {userRank.totalPlayers}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {isSuccess && (
        <div className="relative z-10 grid grid-cols-3 gap-0.5 w-full max-w-xl mb-7">
          {[
            { val: `₹${effectiveScore?.finalPrice?.toLocaleString("en-IN") || 0}`, key: "Final Price", color: "#ffc800" },
            { val: `₹${saved.toLocaleString("en-IN")}`, key: "You Saved", color: "#4ade80" },
            { val: `${discountPercent}% OFF`, key: "Discount", color: "#60a5fa" },
          ].map(({ val, key, color }) => (
            <div key={key} className="flex flex-col items-center justify-center text-center py-5 px-3"
              style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="bebas text-[1.8rem] leading-none" style={{ color }}>{val}</span>
              <span className="text-[0.52rem] tracking-[3px] text-white/30 uppercase mt-1">{key}</span>
            </div>
          ))}
        </div>
      )}

      {!isSuccess && (
        <p className="relative z-10 text-white/30 text-sm tracking-widest uppercase mb-7">
          Bargaining failed. Better luck next time.
        </p>
      )}

      <div className="relative z-10 w-full max-w-xl h-px mb-7" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Buttons */}
      <div className="relative z-10 flex flex-col items-center gap-3 w-full max-w-xl">
        <button className="btn-primary bebas w-full text-[1.1rem] tracking-[5px] py-4 border-none rounded-sm cursor-pointer transition-all duration-100"
          onClick={handleFetchLeaderboard}
          style={{ background: "#ffc800", color: "#0a0a0a", boxShadow: "4px 4px 0 #e63c2f" }}>
          VIEW LEADERBOARD →
        </button>
        <button className="btn-secondary bebas w-3/5 text-[1rem] tracking-[5px] py-3 rounded-sm cursor-pointer transition-all duration-100"
          onClick={handleResetGame}
          style={{ background: "transparent", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}>
          ↺ PLAY AGAIN
        </button>
      </div>

      <p className="relative z-10 bebas text-[0.52rem] tracking-[3px] text-white/18 uppercase mt-6">
        * Score determines your leaderboard rank
      </p>
    </div>
  );
}