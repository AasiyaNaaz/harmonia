import { useState } from "react";
import { Music, Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import SettingsModal from "@/components/SettingsModal";

interface NavigationProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Navigation({ darkMode, setDarkMode }: NavigationProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Studio", path: "/studio" },
    { label: "Voice Match", path: "" },
    { label: "Mini Games", path: "" },
  ];

  const genres = [
    { name: "Pop", path: "/genre/pop" },
    { name: "Classical", path: "/genre/classical" },
    { name: "Electronic", path: "/genre/electronic" },
    { name: "Qawwali", path: "/genre/qawwali" },
    { name: "Folk", path: "/genre/folk" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/*LOGO — FULL GRADIENT*/} 
            <Link href="/">
              <motion.div
                whileHover={{
                  boxShadow: "0 0 18px rgba(255,215,0,0.55)",
                  borderColor: "rgba(255,215,0,0.8)"
                }}
                transition={{ duration: 0.25 }}
                className="
                  flex items-center gap-3 cursor-pointer 
                  px-5 py-2 rounded-xl border border-transparent
                "
              >
                {/* COLORFUL MUSIC NOTE */}
                <span
                  className="
                    text-3xl font-extrabold
                    bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400
                    bg-clip-text text-transparent drop-shadow-lg
                    select-none
                  "
                >
                  ♪
                </span>

                {/* HARMONICA TEXT */}
                <span
                  className="
                    text-3xl font-extrabold tracking-wide
                    bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400
                    bg-clip-text text-transparent drop-shadow-xl
                  "
                >
                  Harmonica
                </span>
              </motion.div>

            </Link>

            {/* =========================
                DESKTOP NAVIGATION
            ========================== */}
            <div className="hidden md:flex items-center gap-3">

              {navItems.map((item) => {
                const active = location === item.path;

                return (
                  <Link key={item.path} href={item.path}>
                    <motion.div
                      whileHover={{
                        scale: 1.12,
                        boxShadow: darkMode
                          ? "0 0 14px rgba(255,255,255,0.45)"
                          : "0 0 14px rgba(0,0,0,0.25)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        px-5 py-2 rounded-xl text-lg font-semibold
                        transition-all duration-300 cursor-pointer border
                        
                        ${
                          active
                            ? darkMode
                              ? "bg-primary/25 text-white border-primary shadow-[0_0_12px_var(--primary)]"
                              : "bg-primary/20 text-black border-primary shadow-[0_0_10px_rgba(100,100,100,0.3)]"
                            : darkMode
                              ? "text-gray-300 hover:text-primary border-transparent"
                              : "text-gray-800 hover:text-primary border-transparent"
                        }
                      `}
                    >
                      {item.label}
                    </motion.div>
                  </Link>
                );
              })}

              {/* SETTINGS BUTTON */}
              <motion.button
                whileHover={{ rotate: 20, scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSettingsOpen(true)}
                className="
                  ml-2 p-2 rounded-xl 
                  hover:bg-primary/20 transition-all
                  text-xl
                "
              >
                <Settings className="h-6 w-6" />
              </motion.button>
            </div>

            {/* =========================
                MOBILE TOGGLE BUTTON
            ========================== */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

          </div>
        </div>

        {/* =========================
            MOBILE MENU
        ========================== */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t bg-card shadow-lg"
            >
              <div className="px-6 py-4 space-y-3">

                {navItems.map((item) => {
                  const active = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={active ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}

                {/* GENRES */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold opacity-70 mb-2 px-3">Genres</p>
                  {genres.map((genre) => (
                    <Link key={genre.path} href={genre.path}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {genre.name}
                      </Button>
                    </Link>
                  ))}
                </div>

                {/* SETTINGS */}
                <Button
                  variant="ghost"
                  className="w-full justify-start mt-4"
                  onClick={() => {
                    setSettingsOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* SETTINGS MODAL */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </>
  );
}
