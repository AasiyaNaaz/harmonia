import { useState } from "react";
import { Music, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Navigation({ darkMode, setDarkMode }: NavigationProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Studio", path: "/studio" },
    // Removed Genres button here, you can re-add if fixed
  ];

  const genres = [
    { name: "Pop", path: "/genre/pop" },
    { name: "Classical", path: "/genre/classical" },
    { name: "Electronic", path: "/genre/electronic" },
    { name: "Qawwali", path: "/genre/qawwali" },
    { name: "Folk", path: "/genre/folk" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate px-3 py-2 rounded-md" data-testid="link-home">
              <Music className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">MusicLab</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "secondary" : "ghost"}
                  className="text-base"
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}

            {/* Dark mode toggle button */}
            <Button
              variant="ghost"
              onClick={() => setDarkMode(!darkMode)}
              className="ml-4"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

        </div>
      </div>

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
                    data-testid={`mobile-link-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}

              <Button
                variant="ghost"
                onClick={() => {
                  setDarkMode(!darkMode);
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start flex items-center gap-1"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <>
                    <Sun className="h-5 w-5 text-yellow-400" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5 text-gray-600" /> Dark Mode
                  </>
                )}
              </Button>

              {/* Genres section remains for mobile */}
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-muted-foreground mb-2 px-3">Genres</p>
                {genres.map((genre) => (
                  <Link key={genre.path} href={genre.path}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`mobile-link-genre-${genre.name.toLowerCase()}`}
                    >
                      {genre.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
