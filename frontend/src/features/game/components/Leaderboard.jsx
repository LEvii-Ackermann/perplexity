import React, { useEffect } from "react";
import { useGame } from "../hooks/useGame.js";

export default function Leaderboard() {
  const { leaderboard, handleFetchLeaderboard, handleResetGame, loading, userRank } = useGame();

  useEffect(() => {
    if (!leaderboard?.length) {
      handleFetchLeaderboard({ navigateToLeaderboard: false });
    }
  }, []);

  // Is the current user in top 10?
  const myRankNum = userRank?.rank;
  const isInTop10 = myRankNum && myRankNum <= 10;

  const getStyle = (rank, isMe) => {
    if (isMe) return { row: "bg-green-400/5 border-b border-green-400/10", rankColor: "#4ade80", scoreColor: "#4ade80", userColor: "#4ade80" };
    if (rank === 1) return { row: "bg-yellow-400/5 border-b border-yellow-400/[0.08]", rankColor: "#ffc800", scoreColor: "#ffc800", userColor: "#fff" };
    if (rank === 2) return { row: "bg-white/[0.03] border-b border-white/[0.04]", rankColor: "#c0c0c0", scoreColor: "#c0c0c0", userColor: "#fff" };
    if (rank === 3) return { row: "bg-orange-900/10 border-b border-white/[0.04]", rankColor: "#cd7f32", scoreColor: "#cd7f32", userColor: "#fff" };
    return { row: "border-b border-white/[0.04]", rankColor: "rgba(255,255,255,0.18)", scoreColor: "rgba(255,255,255,0.5)", userColor: "#fff" };
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
        <div className="grid px-3.5 pb-2 border-b border-white/[0.08] mb-1"
          style={{ gridTemplateColumns: "40px 1fr 60px 70px" }}>
          {["#", "Player", "Rounds", "Score"].map((h, i) => (
            <span key={h} className="text-[0.45rem] tracking-[3px] text-white/20 uppercase"
              style={{ textAlign: i === 2 ? "center" : i === 3 ? "right" : "left" }}>
              {h}
            </span>
          ))}
        </div>

        {/* Top 10 Rows */}
        {loading ? (
          <p className="bebas text-center text-white/20 tracking-[4px] py-10">LOADING...</p>
        ) : leaderboard?.map((entry, i) => {
          const rank = i + 1;
          const isMe = myRankNum === rank;
          const s = getStyle(rank, isMe);
          return (
            <div key={i} className={`grid items-center px-3.5 py-2.5 ${s.row}`}
              style={{ gridTemplateColumns: "40px 1fr 60px 70px" }}>
              <span className="bebas text-[1.4rem] leading-none" style={{ color: s.rankColor }}>{rank}</span>
              <div className="min-w-0">
                <p className="text-[0.82rem] font-bold truncate" style={{ color: s.userColor }}>
                  {entry.user}{isMe ? " ← you" : ""}
                </p>
                <p className="text-[0.5rem] tracking-[2px] text-white/22 uppercase truncate mt-0.5">{entry.product}</p>
              </div>
              <div className="text-center">
                <span className="bebas text-[1.1rem] leading-none text-white/25">{entry.attemps ?? "—"}</span>
              </div>
              <div className="text-right">
                <span className="bebas text-[1.6rem] leading-none" style={{ color: s.scoreColor }}>{entry.score}</span>
              </div>
            </div>
          );
        })}

        {/* User not in top 10 — show below with separator */}
        {!isInTop10 && myRankNum && userRank && (
          <>
            {/* Dotted separator */}
            <div className="flex items-center gap-2 px-3.5 py-2">
              <div className="flex-1 border-t border-dashed border-white/[0.08]" />
              <span className="bebas text-[0.45rem] tracking-[3px] text-white/15 uppercase">Your Position</span>
              <div className="flex-1 border-t border-dashed border-white/[0.08]" />
            </div>

            {/* Your row */}
            <div className="grid items-center px-3.5 py-2.5 bg-green-400/5 border border-green-400/20 rounded-sm"
              style={{ gridTemplateColumns: "40px 1fr 60px 70px" }}>
              <span className="bebas text-[1.4rem] leading-none text-green-400">#{myRankNum}</span>
              <div className="min-w-0">
                <p className="text-[0.82rem] font-bold text-green-400 truncate">
                  {userRank.user ?? "you"} ← you
                </p>
                <p className="text-[0.5rem] tracking-[2px] text-white/22 uppercase mt-0.5">
                  out of {userRank.totalPlayers} players
                </p>
              </div>
              <div className="text-center">
                <span className="bebas text-[1.1rem] leading-none text-white/25">—</span>
              </div>
              <div className="text-right">
                <span className="bebas text-[1.6rem] leading-none text-green-400">{userRank.score}</span>
              </div>
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex gap-2 mt-5">
          <button className="btn-primary bebas flex-1 text-[1rem] tracking-[4px] py-3.5 border-none rounded-sm cursor-pointer transition-all duration-100"
            onClick={handleResetGame}
            style={{ background: "#ffc800", color: "#0a0a0a", boxShadow: "3px 3px 0 #e63c2f" }}>
            ↺ PLAY AGAIN
          </button>
          <button className="btn-secondary bebas text-[1rem] tracking-[4px] py-3.5 px-6 rounded-sm cursor-pointer transition-all duration-100"
            onClick={handleResetGame}
            style={{ background: "transparent", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}>
            ← MENU
          </button>
        </div>

      </div>
    </div>
  );
}