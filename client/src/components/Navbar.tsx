import React from "react";
import { useLocation } from "wouter";
import { Home } from "lucide-react";

export default function Navbar() {
  const [, setLocation] = useLocation();

  return (
    <nav className="w-full p-4 shadow-md bg-gradient-to-r from-pink-500 to-purple-600 flex justify-between items-center text-white fixed top-0 left-0 z-50">
      <h1
        className="text-xl font-bold cursor-pointer select-none"
        onClick={() => setLocation("/")}
      >
        Harmonica
      </h1>
      <button
        aria-label="Go Home"
        onClick={() => setLocation("/")}
        className="hover:bg-white hover:bg-opacity-25 p-2 rounded transition"
      >
        <Home size={24} />
      </button>
    </nav>
  );
}
