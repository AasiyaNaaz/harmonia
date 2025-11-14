import React from "react";
import { motion } from "framer-motion";
import { Music, Drum, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Hero_musical_scene_bb6ab737.png";

type Genre = {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  path: string;
};

export default function HomePage(): JSX.Element {
  // Dark mode toggle state (persistent)
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("harmonica-theme");
      if (saved !== null) return JSON.parse(saved);
    }
    // FIRST TIME EVER → DARK
    return true;
  });

  // Apply theme + save it
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("harmonica-theme", JSON.stringify(darkMode));
  }, [darkMode]);

  const features = [
    {
      icon: Music,
      title: "Explore Genres",
      description: "Discover Pop, Classical, Electronic, Qawwali, and Folk music",
      gradient: "from-pink-500 to-purple-600",
      path: "/genre/pop",
    },
    {
      icon: Drum,
      title: "Play Studio",
      description: "Interactive virtual instruments with realistic sounds",
      gradient: "from-cyan-500 to-blue-600",
      path: "/studio",
    },
    {
      icon: Sparkles,
      title: "Learn Instruments",
      description: "Hands-on tutorials and tips for every instrument",
      gradient: "from-amber-500 to-orange-600",
      path: "/tutorials",
    },
  ];

  const genres: Genre[] = [
    { name: "Pop", icon: Music, color: "from-pink-500 to-purple-600", path: "/genre/pop" },
    { name: "Classical", icon: Sparkles, color: "from-yellow-600 to-red-800", path: "/genre/classical" },
    { name: "Electronic", icon: Drum, color: "from-cyan-400 to-blue-600", path: "/genre/electronic" },
    { name: "Qawwali", icon: Play, color: "from-emerald-500 to-amber-500", path: "/genre/qawwali" },
    { name: "Folk", icon: Music, color: "from-amber-700 to-orange-500", path: "/genre/folk" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-500">
      {/* DARK MODE TOGGLE */}
      <div className="fixed top-5 right-6 z-50">
        <button
          onClick={() => setDarkMode((prev: boolean) => !prev)}
          className="px-3 py-2 rounded bg-gray-800 text-white dark:bg-gray-200 dark:text-black shadow hover:opacity-90 transition"
          aria-pressed={darkMode}
          aria-label="Toggle theme"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* HERO SECTION */}
      <div
        className="relative min-h-[600px] flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom,rgba(40,30,80,0.6),rgba(50,60,108,0.82)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 dark:via-background/20 to-background" />

        {/* Vibrant animated title */}
        <motion.h1
          className="relative z-10 text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-300 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg select-none py-10 px-6"
          style={{ fontFamily: "'Orbitron', 'Montserrat', sans-serif", letterSpacing: "0.06em" }}
          animate={{
            y: [0, -8, 0, 8, 0],
            textShadow: [
              "0 2px 16px rgba(253, 224, 71,0.30), 0 4px 24px #f472b6",
              "0 1px 8px #06b6d4",
              "0 2px 28px #d946ef",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror" }}
        >
          Harmonica
        </motion.h1>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto py-3">
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Learn various music genres and play instruments virtually in our interactive GarageBand-inspired studio
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/studio">
              <Button size="lg" className="text-lg px-8 bg-black bg-opacity-50 backdrop-blur-md border border-white/20 text-white hover:bg-black hover:bg-opacity-70">
                <Play className="mr-2 h-5 w-5" />
                Try the Studio
              </Button>
            </Link>
          </div>
        </div>

        <motion.div className="absolute bottom-10 left-1/2 transform -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="text-white text-opacity-90 text-sm drop-shadow-md font-semibold">Scroll to explore</div>
        </motion.div>
      </div>

      {/* MAIN CONTENT */}
      <main className="py-24 px-6 flex-1">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Start Learning Today
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Interactive, musical, and lively - everything you need to explore music
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}>
                <Card className="p-8 h-full hover-elevate active-elevate-2 cursor-pointer">
                  <div className={`w-16 h-16 rounded-md bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          <section className="mb-24">
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Explore Music Styles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
              {genres.map((genre, index) => {
                const Icon = genre.icon;
                return (
                  <Link key={genre.name} href={genre.path}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                      <Card
                        className={`relative p-12 text-center cursor-pointer bg-gradient-to-br ${genre.color} border-0 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.05]`}
                      >
                        {/* Floating sparkles */}
                        <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
                          <div className="absolute top-4 right-6 w-2 h-2 bg-white rounded-full opacity-70 blur-[0.5px]" />
                          <div className="absolute bottom-6 left-10 w-3 h-3 bg-white rounded-full opacity-60 blur-[0.5px]" />
                          <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-75 blur-[0.5px]" />
                        </motion.div>

                        {/* Wavy shine animation (very subtle) */}
                        <motion.div className="absolute inset-0" style={{ mixBlendMode: "overlay", background: "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.0))" }} animate={{ x: ["-30%", "30%"] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }} />

                        {/* Icon */}
                        <Icon className="mx-auto mb-4 h-12 w-12 text-white drop-shadow-xl" />

                        {/* Title */}
                        <h3 className="text-3xl font-extrabold text-white drop-shadow-2xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          {genre.name}
                        </h3>

                        {/* Subtext */}
                        <p className="text-white/90 mt-2 text-sm">Tap to explore</p>
                      </Card>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* AMAZON-STYLE FOOTER */}
      <footer className="mt-auto py-12 px-6 bg-[#222F3E] text-white">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-4 sm:grid-cols-2 text-sm">
          <div>
            <div className="font-bold mb-2">Get to Know Us</div>
            <Link href="#">
              <div className="hover:underline cursor-pointer">About</div>
            </Link>
            <Link href="#">
              <div className="hover:underline cursor-pointer">Careers</div>
            </Link>
            <Link href="#">
              <div className="hover:underline cursor-pointer">Press Releases</div>
            </Link>
            <Link href="#">
              <div className="hover:underline cursor-pointer">Instruments Science</div>
            </Link>
          </div>
          <div>
            <div className="font-bold mb-2">Connect with Us</div>
            <a href="https://facebook.com/" className="hover:underline block" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            <a href="https://twitter.com/" className="hover:underline block" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a href="https://instagram.com/" className="hover:underline block" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
          <div>
            <div className="font-bold mb-2">Make Music with Us</div>
            <Link href="/studio">
              <div className="hover:underline cursor-pointer">Play Studio</div>
            </Link>
            <Link href="/tutorials">
              <div className="hover:underline cursor-pointer">Learn Instruments</div>
            </Link>
            <Link href="/genre/pop">
              <div className="hover:underline cursor-pointer">Genres</div>
            </Link>
          </div>
          <div>
            <div className="font-bold mb-2">Let Us Help You</div>
            <Link href="#">
              <div className="hover:underline cursor-pointer">Your Account</div>
            </Link>
            <Link href="#">
              <div className="hover:underline cursor-pointer">Help</div>
            </Link>
            <Link href="#">
              <div className="hover:underline cursor-pointer">Feedback</div>
            </Link>
          </div>
        </div>
        <div className="text-center text-xs mt-8 opacity-70">© {new Date().getFullYear()} Harmonica • All rights reserved.</div>
      </footer>
    </div>
  );
}
