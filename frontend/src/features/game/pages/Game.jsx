import React from "react";
import { Outlet } from "react-router";

export default function Game() {
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
      <Outlet />
    </>
  );
}