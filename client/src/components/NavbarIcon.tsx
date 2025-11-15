// src/components/NavbarIcon.tsx
import React from "react";
import { useLocation } from "wouter";
import { Home } from "lucide-react";

export default function NavbarIcon() {
  const [, setLocation] = useLocation();
  return (
    <nav className="fixed top-4 left-4 z-50 bg-purple-700 rounded-full p-2 shadow-lg cursor-pointer hover:bg-purple-900 transition">
      <Home color="white" size={28} onClick={() => setLocation("/")} />
    </nav>
  );
}
