import React, { useState } from "react";
import { useGame } from "../hooks/useGame.js";
import { Navigate } from "react-router";

import doraemon from "../../../assets/doraemon_-happy_-character_-art-0b2iuj8yrk0phmov-depositphotos-bgremover.png";
import shinchan from "../../../assets/shinchan-png-photo-750x750.webp";
import nobita from "../../../assets/minnie-mouse-mickey-mouse-clip-art-mouse-thumbnail-depositphotos-bgremover.png";
import mrBean from "../../../assets/mr-bean-avatar-character-cartoon-rowan-atkinson-png-image-33.webp";
import bheem from "../../../assets/chhota-bheem-24-711x1024.webp";
import jerry from "../../../assets/tom_and_jerry_PNG3.webp";
import mickey from "../../../assets/purepng.com-mickey-mousemickey-mousemickeymouseanimal-cartooncharacterwalt-disneyub-iwerksstudioslarge-yellow-shoered-shortswhite-glovesnetflix-1701528649769swu.webp";
import tom from "../../../assets/ec9a07483bfc93250704db750f5c4c2f-depositphotos-bgremover.png";

const BUYERS = [
  { id: "b1", name: "BUYER 1", img: doraemon },
  { id: "b2", name: "BUYER 2", img: shinchan },
  { id: "b3", name: "BUYER 3", img: bheem },
  { id: "b4", name: "BUYER 4", img: jerry },
];

const SELLERS = [
  { id: "s1", name: "SELLER 1", img: nobita },
  { id: "s2", name: "SELLER 2", img: mrBean },
  { id: "s3", name: "SELLER 3", img: mickey },
  { id: "s4", name: "SELLER 4", img: tom },
];

export default function CharacterSelection() {
  const { product, originalPrice, handleSelectCharacters, handleStartGame, loading } = useGame();
  const [selectedBuyer, setSelectedBuyer] = useState("b4");
  const [selectedSeller, setSelectedSeller] = useState("s4");

  if (!product || !originalPrice) {
    return <Navigate to="/game/item-selection" replace />;
  }

  const onStart = async () => {
    const buyer = BUYERS.find((b) => b.id === selectedBuyer);
    const seller = SELLERS.find((s) => s.id === selectedSeller);
    handleSelectCharacters(buyer, seller);
    await handleStartGame();
  };

  const row1 = [BUYERS[0], BUYERS[1], SELLERS[0], SELLERS[1]];
  const row2 = [BUYERS[2], BUYERS[3], SELLERS[2], SELLERS[3]];

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-8"
      style={{ background: "#13121f", fontFamily: "'Sora', sans-serif" }}
    >
      <div className="w-full" style={{ maxWidth: "820px" }}>

        {/* ── Headers ── */}
        <div className="flex justify-between mb-7">
          <div
            className="font-extrabold uppercase tracking-widest text-md px-6 py-4 rounded-sm -translate-y-5"
            style={{ background: "#d4920c", color: "#1a0e00", letterSpacing: "1px", transform: "rotate(-3deg)" }}
          >
            CHOOSE YOUR CHARACTER
          </div>
          <div
            className="font-extrabold uppercase tracking-widest text-md px-6 py-4 rounded-sm -translate-y-5"
            style={{ background: "#b83050", color: "#1a0e00", letterSpacing: "1px", transform: "rotate(3deg)" }}
          >
            YOUR OPPONENT
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-4 gap-y-5 gap-x-20 mb-6">
          {[...row1, ...row2].map((char) => {
            const isSeller = char.id.startsWith("s");
            const isSelected = isSeller
              ? selectedSeller === char.id
              : selectedBuyer === char.id;
            return (
              <CharacterCard
                key={char.id}
                char={char}
                isSelected={isSelected}
                isSeller={isSeller}
                onSelect={() =>
                  isSeller
                    ? setSelectedSeller(char.id)
                    : setSelectedBuyer(char.id)
                }
              />
            );
          })}
        </div>

        {/* ── Start Button ── */}
        <div className="flex justify-center">
          <button
            onClick={onStart}
            disabled={loading}
            className="font-extrabold uppercase text-md flex items-center gap-1 transition-all duration-200 m-8"
            style={{
              background: "#13121f",
              border: "1.5px solid #3a394e",
              color: "#6a6a80",
              padding: "15px 30px",
              borderRadius: "2px",
              letterSpacing: "3px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#d4920c";
              e.currentTarget.style.borderColor = "#d4920c";
              e.currentTarget.style.color = "#1a0e00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#13121f";
              e.currentTarget.style.borderColor = "#3a394e";
              e.currentTarget.style.color = "#6a6a80";
            }}
          >
            {loading ? "LOADING..." : "START NEGOTIATION"} <span>➔</span>
          </button>
        </div>

      </div>
    </div>
  );
}

function CharacterCard({ char, isSelected, isSeller, onSelect }) {
  const borderColor = isSelected
    ? isSeller
      ? "#c03030"
      : "#d4920c"
    : "#2a2c4a";

  const labelBg = isSelected
    ? isSeller
      ? "#8a1c1c"
      : "#b07800"
    : "#181845";

  const labelColor = isSelected ? "#ffffff" : "#7880aa";

  return (
    <div
      onClick={onSelect}
      className="flex flex-col rounded-lg overflow-hidden cursor-pointer transition-all duration-150"
      style={{
        background: "#1c1d35",          
        border: `2px solid ${borderColor}`,
        transform: isSelected ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "#44466a";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "#2a2c4a";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {/* Image area — same dark blue bg as the card, image fills it */}
      <div
        className="flex items-center justify-center"
        style={{
          background: "#13121f",
          padding: "16px 12px 15px",
          minHeight: "160px",
        }}
      >
        <img
          src={char.img}
          alt={char.name}
          style={{
            width: "100%",
            height: "150px",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* Label */}
      <div
        className="text-center font-extrabold uppercase"
        style={{
          background: labelBg,
          color: "whitesmoke",
          fontSize: "11px",
          letterSpacing: "1px",
          padding: "8px 6px",
        }}
      >
        {char.name}
      </div>
    </div>
  );
}