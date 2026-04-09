import React from "react";
import { useGame } from "../hooks/useGame.js";

// Import UI Components from our redesign
import ItemSelection from "../components/ItemSelection.jsx";
import CharacterSelection from "../components/CharacterSelection.jsx";
import NegotiationBoard from "../components/NegotiationBoard.jsx";
import ScoreBoard from "../components/ScoreBoard.jsx";
import Leaderboard from "../components/Leaderboard.jsx";

export default function Game() {
  const { view } = useGame();

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shadow-text-custom {
          text-shadow: 2px 2px 0px rgba(0,0,0,0.2);
        }
      `}</style>

      {view === "item_selection" && <ItemSelection />}
      {view === "character_selection" && <CharacterSelection />}
      {view === "negotiation" && <NegotiationBoard />}
      {view === "result" && <ScoreBoard />}
      {view === "leaderboard" && <Leaderboard />}
    </>
  );
}