import React from "react";
import { useGame } from "../hooks/useGame.js";

const ITEMS = [
  { emoji: "⌨️", name: "Limited Ed. Mech Keyboard", originalPrice: 15000 },
  { emoji: "📱", name: "Smartphone", originalPrice: 15000 },
  { emoji: "👟", name: "Sneakers", originalPrice: 3500 },
  { emoji: "🎧", name: "Headphones", originalPrice: 4000 },
  { emoji: "⌚", name: "Watch", originalPrice: 8000 },
  { emoji: "🕶️", name: "Sunglasses", originalPrice: 1200 },
];

export default function ItemSelection() {
  const { handleSelectProduct, loading } = useGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0d] font-sora p-6">
      <div className="text-[0.72rem] text-orange-500/80 tracking-widest uppercase font-semibold mb-2">
        Bargain Mode
      </div>
      <h1 className="text-3xl font-semibold text-[#e8e8e8] mb-2 text-center">
        Pick something to bargain
      </h1>
      <p className="text-sm text-white/35 mb-9 text-center">
        Outsmart the shopkeeper. Get the best deal.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full">
        {ITEMS.map((item) => (
          <button
            key={item.name}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-white/5 bg-[#131313] hover:border-orange-500/40 hover:bg-[#1a1a1a] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            onClick={() => handleSelectProduct(item.name, item.originalPrice)}
            disabled={loading}
          >
            <span className="text-4xl">{item.emoji}</span>
            <span className="text-sm text-white/70 font-medium">
              {item.name}
            </span>
            <span className="text-xs text-white/35">
              ₹{item.originalPrice.toLocaleString("en-IN")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
