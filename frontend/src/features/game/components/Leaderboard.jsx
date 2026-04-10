import React, { useEffect } from "react";
import { useGame } from "../hooks/useGame.js";

export default function Leaderboard() {
  const { leaderboard, handleFetchLeaderboard, handleResetGame, loading, scoreCard } = useGame();

  useEffect(() => {
    if (!leaderboard || leaderboard.length === 0) {
      handleFetchLeaderboard({ navigateToLeaderboard: false });
    }
  }, []);

  const currentUser = scoreCard?.user?.username || null;

  const getStyle = (i, isMe) => {
    if (isMe) return { row: "bg-green-400/5 border-b border-green-400/10", rank: "#4ade80", score: "#4ade80", user: "#4ade80" };
    if (i === 0) return { row: "bg-yellow-400/5 border-b border-yellow-400/8", rank: "#ffc800", score: "#ffc800", user: "#fff" };
    if (i === 1) return { row: "bg-white/[0.03] border-b border-white/[0.04]", rank: "#c0c0c0", score: "#c0c0c0", user: "#fff" };
    if (i === 2) return { row: "bg-orange-900/10 border-b border-white/[0.04]", rank: "#cd7f32", score: "#cd7f32", user: "#fff" };
    return { row: "border-b border-white/[0.04]", rank: "rgba(255,255,255,0.18)", score: "rgba(255,255,255,0.5)", user: "#fff" };
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 py-8"
      style={{ background: "#0a0a0a", fontFamily: "'Noto Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans:wght@400;700&display=swap');
        .bebas { font-family: 'Bebas Neue', sans-serif; }
        .stripe::before { content:''; position:absolute; inset:0; pointer-events:none;
          background: repeating-linear-gradient(-55deg, transparent, transparent 40px, rgba(255,200,0,0.015) 40px, rgba(255,200,0,0.015) 41px); }
        .btn-primary:hover { transform:translate(-2px,-2px) !important; box-shadow:5px 5px 0 #e63c2f !important; }
        .btn-secondary:hover { border-color:rgba(255,255,255,0.3) !important; color:#fff !important; }
      `}</style>

      <div className="stripe absolute inset-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="bebas text-[0.52rem] tracking-[5px] text-yellow-400/40 uppercase">Bargain Arena</span>
          <div className="px-7 py-1.5" style={{ background: "#ffc800", transform: "rotate(-1deg)", boxShadow: "3px 3px 0 #e63c2f" }}>
            <span className="bebas text-[1.6rem] tracking-[4px] text-[#0a0a0a]">TOP CLOSERS</span>
          </div>
          <span className="bebas text-[0.52rem] tracking-[5px] text-yellow-400/40 uppercase">Season 1</span>
        </div>

        {/* Column headers */}
        <div className="grid gap-2 px-3.5 pb-2 border-b border-white/[0.08] mb-1"
          style={{ gridTemplateColumns: "40px 1fr 60px 70px" }}>
          {["#", "Player", "Rounds", "Score"].map((h, i) => (
            <span key={h} className="text-[0.45rem] tracking-[3px] text-white/20 uppercase"
              style={{ textAlign: i >= 2 ? "center" : "left", ...(i === 3 && { textAlign: "right" }) }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <p className="bebas text-center text-white/20 tracking-[4px] py-10">LOADING...</p>
        ) : leaderboard?.map((entry, i) => {
          const isMe = entry.user === currentUser;
          const s = getStyle(i, isMe);
          return (
            <div key={i} className={`grid gap-2 items-center px-3.5 py-2.5 ${s.row}`}
              style={{ gridTemplateColumns: "40px 1fr 60px 70px" }}>
              <span className="bebas text-[1.4rem] leading-none" style={{ color: s.rank }}>{i + 1}</span>
              <div className="min-w-0">
                <p className="text-[0.82rem] font-bold truncate" style={{ color: s.user }}>
                  {entry.user}{isMe ? " (you)" : ""}
                </p>
                <p className="text-[0.5rem] tracking-[2px] text-white/22 uppercase truncate mt-0.5">{entry.product}</p>
              </div>
              <div className="text-center">
                <span className="bebas text-[1.1rem] leading-none text-white/25">{entry.attemps ?? "—"}</span>
              </div>
              <div className="text-right">
                <span className="bebas text-[1.6rem] leading-none" style={{ color: s.score }}>{entry.score}</span>
              </div>
            </div>
          );
        })}

        {/* Buttons */}
        <div className="flex gap-2 mt-5">
          <button className="btn-primary bebas flex-1 text-[1rem] tracking-[4px] py-3.5 border-none rounded-sm cursor-pointer transition-all duration-100"
            onClick={handleResetGame}
            style={{ background: "#ffc800", color: "#0a0a0a", boxShadow: "3px 3px 0 #e63c2f" }}>
            ↺ PLAY AGAIN
          </button>
          <button className="btn-secondary bebas text-[1rem] tracking-[4px] py-3.5 px-6 rounded-sm cursor-pointer transition-all duration-100"
            onClick={handleResetGame}
            style={{ background: "transparent", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}>
            ← MENU
          </button>
        </div>
      </div>
    </div>
  );
}