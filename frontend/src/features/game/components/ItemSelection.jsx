import React from "react";
import { useGame } from "../hooks/useGame.js";
import keyboardImg from "../../../assets/Keyboard-Background-PNG-Image.webp";

export default function ItemSelection() {
  const { handleSelectProduct, handleFetchLeaderboard, loading } = useGame();
  const handleStart = () => handleSelectProduct("Mechanical Keyboard", 50000);

  return (
    <div className="relative min-h-screen w-full grid overflow-hidden"
      style={{ background: "#0a0a0a", gridTemplateColumns: "1fr 2fr 1fr", fontFamily: "'Noto Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans:wght@400;700&display=swap');
        .bebas { font-family: 'Bebas Neue', sans-serif; }
        .stripe-bg::before { content:''; position:absolute; inset:0; pointer-events:none;
          background: repeating-linear-gradient(-55deg, transparent, transparent 40px, rgba(255,200,0,0.018) 40px, rgba(255,200,0,0.018) 41px); }
        .cta-deal:hover { transform: translate(-2px,-2px) !important; box-shadow: 7px 7px 0 #e63c2f !important; }
        .cta-deal:active { transform: translate(2px,2px) !important; box-shadow: 2px 2px 0 #e63c2f !important; }
        .cta-board:hover { border-color: rgba(255,200,0,0.7) !important; color: #ffc800 !important; transform: translateY(-1px); }
      `}</style>

      {/* Stripe bg */}
      <div className="stripe-bg absolute inset-0 pointer-events-none" />

      {/* Top-right leaderboard button */}
      <div className="absolute top-6 right-6 z-30">
        <button
          className="cta-board bebas text-[0.86rem] tracking-[3px] px-5 py-2 rounded-sm cursor-pointer transition-all duration-100"
          onClick={handleFetchLeaderboard}
          disabled={loading}
          style={{
            background: "rgba(10,10,10,0.72)",
            color: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(3px)",
          }}
        >
          LEADERBOARD ↗
        </button>
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="relative z-10 flex flex-col justify-center px-12 py-16 border-r border-white/[0.06]">
        <p className="bebas text-[0.55rem] tracking-[5px] text-yellow-500/50 uppercase mb-8">Today's Deal</p>
        <p className="bebas text-[5.5rem] leading-none text-yellow-400 mb-1">₹50K</p>
        <p className="text-[0.6rem] tracking-[4px] text-white/30 uppercase mb-9">Market price · Can you beat it?</p>

        <div className="flex flex-col gap-5">
          {[["6", "Rounds only"], ["1V1", "You vs AI Seller"], ["₹?", "Your best offer"]].map(([v, k]) => (
            <div key={k} className="border-l-2 pl-3" style={{ borderColor: "rgba(255,200,0,0.25)" }}>
              <p className="bebas text-2xl text-white leading-none">{v}</p>
              <p className="text-[0.58rem] tracking-[3px] text-white/30 uppercase mt-0.5">{k}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CENTER PANEL ── */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16">
        {/* Banner */}
        <div className="bebas text-white text-[1rem] tracking-[6px] px-7 py-2 rounded-sm mb-12"
          style={{ background: "#e63c2f", transform: "rotate(-2deg)", boxShadow: "3px 3px 0 #ffc800" }}>
          BARGAIN ARENA
        </div>

        {/* Title */}
        <h1 className="bebas text-center tracking-wide mb-2.5">
          <span className="block leading-none text-white/50" style={{ fontSize: "clamp(3rem, 6vw, 4.5rem)", letterSpacing: "6px" }}>THE AI WON'T GO EASY.</span>
          <span className="block leading-none" style={{ fontSize: "clamp(4rem, 9vw, 7rem)", color: "#ffc800", letterSpacing: "-1px" }}>WILL YOU?</span>
        </h1>

        <p className="text-[0.72rem] tracking-[4px] text-white/30 uppercase mb-9 text-center">
          Negotiate smart · Win the deal
        </p>

        {/* Keyboard */}
        <div className="relative mb-9">
          <img
            src={keyboardImg}
            alt="Mechanical Keyboard"
            className="block"
            style={{
              width: 420, maxWidth: "85%",
              filter: "drop-shadow(0 24px 60px rgba(255,200,0,0.2)) drop-shadow(0 4px 24px rgba(0,0,0,0.9))"
            }}
          />
          <span className="bebas absolute text-white text-[0.7rem] tracking-[3px] px-3 py-1 rounded-sm"
            style={{ top: 0, left: -16, background: "#e63c2f", transform: "rotate(-7deg)", boxShadow: "2px 2px 0 rgba(0,0,0,0.4)" }}>
            FULL MECH
          </span>
          <span className="bebas absolute text-[0.7rem] tracking-[3px] px-3 py-1 rounded-sm"
            style={{ bottom: 10, right: -16, background: "#ffc800", color: "#0a0a0a", transform: "rotate(5deg)", boxShadow: "2px 2px 0 rgba(0,0,0,0.4)" }}>
            HOT ITEM
          </span>
        </div>

        {/* CTA */}
        <button
          className="cta-deal bebas text-[1.3rem] tracking-[5px] px-14 py-4 rounded-sm border-none cursor-pointer transition-all duration-100 mb-3"
          onClick={handleStart}
          disabled={loading}
          style={{ background: "#ffc800", color: "#0a0a0a", boxShadow: "5px 5px 0 #e63c2f" }}>
          DEAL KARO →
        </button>
        <p className="text-[0.58rem] tracking-[3px] text-white/20 uppercase mt-3 text-center">
          Character chooser up next
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="relative z-10 flex flex-col justify-center items-end text-right px-12 py-16 border-l border-white/[0.06]">
        <p className="bebas text-[0.55rem] tracking-[5px] text-yellow-500/50 uppercase mb-8">How it works</p>
        <p className="bebas text-[1rem] tracking-[4px] text-white/20 mb-5">THE RULES</p>

        <div className="flex flex-col gap-6">
          {[
            ["01", "Pick your character", "Buyer or Seller persona"],
            ["02", "Make your offer", "Type or speak your price"],
            ["03", "AI counters back", "It haggles like a real seller"],
            ["04", "Close the deal", "Best price in 6 rounds wins"],
          ].map(([n, title, desc]) => (
            <div key={n} className="border-r-2 pr-3.5" style={{ borderColor: "rgba(255,200,0,0.25)" }}>
              <p className="bebas text-[2.5rem] leading-none text-yellow-400 opacity-40">{n}</p>
              <p className="text-[0.78rem] tracking-[2px] text-white font-bold uppercase">{title}</p>
              <p className="text-[0.65rem] tracking-[2px] text-white/40 uppercase mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] w-full flex flex-col items-end">
          <p className="bebas text-[1.4rem] tracking-[2px] text-white leading-none">Mechanical Keyboard</p>
          <p className="text-[0.58rem] tracking-[3px] text-white/25 uppercase mt-1">Today's negotiation item</p>
        </div>
      </div>
    </div>
  );
}