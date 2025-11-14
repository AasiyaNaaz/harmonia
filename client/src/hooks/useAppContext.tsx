import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

const AppContext = createContext<AppContextProps | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("harmonica-theme");
    if (saved !== null) return JSON.parse(saved);
    return true; // default DARK mode
  });

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    localStorage.setItem("harmonica-theme", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <AppContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}
