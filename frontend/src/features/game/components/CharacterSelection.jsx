import React, { useState } from "react";
import { useGame } from "../hooks/useGame.js";

const BUYERS = [
  { id: "b1", name: "BUYER 1", emoji: "🐙", bg: "bg-blue-600/20", border: "border-blue-500" },
  { id: "b2", name: "BUYER 2", emoji: "👦", bg: "bg-blue-600/20", border: "border-blue-500" },
  { id: "b3", name: "BUYER 3", emoji: "🐱", bg: "bg-blue-600/20", border: "border-blue-500" },
  { id: "b4", name: "BUYER 4", emoji: "🐭", bg: "bg-orange-500/20", border: "border-orange-500" },
];

const SELLERS = [
  { id: "s1", name: "SELLER 1", emoji: "⛄", bg: "bg-indigo-600/20", border: "border-indigo-500" },
  { id: "s2", name: "SELLER 2", emoji: "🙎‍♂️", bg: "bg-indigo-600/20", border: "border-indigo-500" },
  { id: "s3", name: "SELLER 3", emoji: "🥷", bg: "bg-indigo-600/20", border: "border-indigo-500" },
  { id: "s4", name: "SELLER 4", emoji: "😼", bg: "bg-indigo-600/20", border: "border-indigo-500" },
];

export default function CharacterSelection() {
  const { handleSelectCharacters, handleStartGame, loading } = useGame();
  
  const [selectedBuyer, setSelectedBuyer] = useState("b4");
  const [selectedSeller, setSelectedSeller] = useState("s4");

  const onStart = async () => {
    const buyer = BUYERS.find(b => b.id === selectedBuyer);
    const seller = SELLERS.find(s => s.id === selectedSeller);
    handleSelectCharacters(buyer, seller);
    await handleStartGame();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1c1d21] font-sora p-6">
      <div className="w-full max-w-4xl opacity-0 animate-[fadeUp_0.3s_ease_both]">
        {/* Header Titles */}
        <div className="flex justify-between w-full mb-8">
          <div className="bg-orange-300 text-orange-950 font-bold px-4 py-2 text-xl shadow-md uppercase tracking-wide">
            CHOOSE YOUR CHARACTER
          </div>
          <div className="bg-red-300 text-red-950 font-bold px-6 py-2 text-xl shadow-md uppercase tracking-wide">
            YOUR OPPONENT
          </div>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          {/* Row 1 - Buyers */}
          {[BUYERS[0], BUYERS[1]].map((char) => (
            <CharacterCard key={char.id} char={char} isSelected={selectedBuyer === char.id} onSelect={() => setSelectedBuyer(char.id)} />
          ))}
          {/* Row 1 - Sellers */}
          {[SELLERS[0], SELLERS[1]].map((char) => (
            <CharacterCard key={char.id} char={char} isSelected={selectedSeller === char.id} onSelect={() => setSelectedSeller(char.id)} />
          ))}
          
          {/* Row 2 - Buyers */}
          {[BUYERS[2], BUYERS[3]].map((char) => (
            <CharacterCard key={char.id} char={char} isSelected={selectedBuyer === char.id} onSelect={() => setSelectedBuyer(char.id)} />
          ))}
          {/* Row 2 - Sellers */}
          {[SELLERS[2], SELLERS[3]].map((char) => (
            <CharacterCard key={char.id} char={char} isSelected={selectedSeller === char.id} onSelect={() => setSelectedSeller(char.id)} />
          ))}
        </div>

        {/* Start Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onStart}
            disabled={loading}
            className={`bg-[#2c2c2f] text-white/50 px-8 py-3 font-bold text-lg rounded-sm uppercase tracking-wider transition-all duration-200 shadow-md flex items-center gap-2
              ${!loading ? "hover:bg-[#38383c] hover:text-white cursor-pointer" : "opacity-70 cursor-not-allowed"}
            `}
          >
            {loading ? "LOADING..." : "START NEGOTIATION"} <span className="text-xl">➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CharacterCard({ char, isSelected, onSelect }) {
  return (
    <div 
      className={`relative flex flex-col items-center bg-[#25252b] rounded-md transition-all duration-200 cursor-pointer overflow-hidden pb-8
        ${isSelected ? "ring-2 ring-orange-400 transform -translate-y-1 shadow-lg shadow-orange-500/20" : "hover:-translate-y-1 hover:ring-1 hover:ring-white/20"}
      `}
      onClick={onSelect}
    >
      <div className={`w-full aspect-[4/5] flex items-center justify-center border-b border-black/40 ${char.bg}`}>
         <span className="text-7xl">{char.emoji}</span>
      </div>
      <div className={`absolute bottom-0 w-full py-2 flex justify-center 
        ${isSelected ? "bg-orange-800 text-white" : "bg-[#1c1c24] text-indigo-200"} font-black italic uppercase text-sm`}>
        {char.name}
      </div>
    </div>
  );
}
