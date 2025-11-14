import { useState } from "react";
import { Music, Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import SettingsModal from "@/components/SettingsModal"; // <— ADD THIS

interface NavigationProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Navigation({ darkMode, setDarkMode }: NavigationProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Settings Modal control
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
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover-elevate px-3 py-2 rounded-md">
                <Music className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Explore our pages</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={location === item.path ? "secondary" : "ghost"}
                    className="text-base"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}

              {/* Settings Button */}
              <Button
                variant="ghost"
                className="ml-4"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile menu button */}
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t bg-card"
            >
              <div className="px-6 py-4 space-y-2">

                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={location === item.path ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}

                {/* Genres Section */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold text-muted-foreground mb-2 px-3">Genres</p>
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

                {/* Settings button for mobile */}
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

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </>
  );
}
