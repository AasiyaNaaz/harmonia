import React from "react";
import { motion } from "framer-motion";
import { Music, Drum, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Hero_musical_scene_bb6ab737.png";

type HomePageProps = {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
};

type Genre = {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  path: string;
};

export default function HomePage({ darkMode, setDarkMode }: HomePageProps) {
  const genres: Genre[] = [
    { name: "Pop", icon: Music, color: "from-pink-500 to-purple-600", path: "/genre/pop" },
    { name: "Classical", icon: Sparkles, color: "from-yellow-600 to-red-800", path: "/genre/classical" },
    { name: "Electronic", icon: Drum, color: "from-cyan-400 to-blue-600", path: "/genre/electronic" },
    { name: "Qawwali", icon: Play, color: "from-emerald-500 to-amber-500", path: "/genre/qawwali" },
    { name: "Folk", icon: Music, color: "from-amber-700 to-orange-500", path: "/genre/folk" },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">

      {/* HERO */}
      <div
        className="relative min-h-[600px] flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom,rgba(40,30,80,0.6),rgba(50,60,108,0.82)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 dark:via-background/10 to-background" />

        <motion.h1
          className="
            relative z-10 text-7xl md:text-8xl font-extrabold 
            bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 
            bg-clip-text text-transparent select-none py-10 px-6
          "
          style={{
            fontFamily: "'Audiowide', sans-serif",
            letterSpacing: "0.08em",
            textShadow: `
              0 0 10px rgba(255, 200, 55, 0.4),
              0 0 20px rgba(255, 105, 180, 0.35),
              0 0 30px rgba(0, 255, 255, 0.35)
            `
          }}
          animate={{
            y: [0, -8, 0, 8, 0],
            scale: [1, 1.03, 1],
            filter: [
              "drop-shadow(0 0 6px rgba(255,255,255,0.3))",
              "drop-shadow(0 0 12px rgba(255,255,255,0.45))",
              "drop-shadow(0 0 6px rgba(255,255,255,0.3))"
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
        >
          Harmonica
        </motion.h1>


        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto py-3">
          <p
            className="text-xl md:text-2xl theme-text opacity-90 italic font-semibold"
            style={{ fontFamily: "'Oxanium', sans-serif" }}
          >
            Learn various music genres and play instruments virtually in our interactive GarageBand-inspired studio
          </p>

          <Link href="/studio">
            <Button
              size="lg"
              className="text-lg px-8 bg-black/10 dark:bg-white/10 backdrop-blur-md 
                border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              <Play className="mr-2 h-5 w-5" />
              Try the Studio
            </Button>
          </Link>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="theme-text opacity-80 text-sm drop-shadow-md font-semibold">
            Scroll to explore
          </div>
        </motion.div>
      </div>

      {/* MAIN */}
      <main
        className="py-24 px-6 flex-1"
        style={{
          backgroundImage: "var(--harmonica-main-bg)",
          backgroundSize: "cover",
          backgroundBlendMode: "overlay"
        }}
      >
        <div className="max-w-6xl mx-auto">

          {/* TITLE */}
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2
              className="text-4xl md:text-5xl font-bold theme-text mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Start Learning Today
            </h2>

            <p
              className="text-lg theme-text opacity-70 max-w-2xl mx-auto"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Interactive, musical, and lively — everything you need to explore music
            </p>
          </motion.div>

          {/* FEATURES */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {[
              {
                icon: Music,
                title: "Explore Genres",
                desc: "Discover Pop, Classical, Electronic, Qawwali, and Folk music",
                gradient: "from-pink-500 to-purple-600"
              },
              {
                icon: Drum,
                title: "Play Studio",
                desc: "Interactive virtual instruments with realistic sounds",
                gradient: "from-cyan-500 to-blue-600"
              },
              {
                icon: Sparkles,
                title: "Learn Instruments",
                desc: "Hands-on tutorials and tips for every instrument",
                gradient: "from-amber-500 to-orange-600"
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
              >
                <Card
                  className="p-8 h-full border border-white/10 backdrop-blur-xl rounded-2xl 
                    hover:shadow-xl hover:shadow-purple-500/10 transition-all"
                  style={{ background: "var(--card-bg)" }}
                >
                  <div
                    className={`w-16 h-16 rounded-md bg-gradient-to-br ${f.gradient} 
                      flex items-center justify-center mb-6`}
                  >
                    <f.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3
                    className="text-2xl font-semibold theme-text mb-3"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {f.title}
                  </h3>

                  <p className="theme-text opacity-70" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {f.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* GENRES */}
          <section className="mb-24">
            <h2
              className="text-3xl font-bold text-center theme-text mb-8"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Explore Music Styles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
              {genres.map((genre, index) => {
                const Icon = genre.icon;
                return (
                  <Link key={genre.name} href={genre.path}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                      <Card
                        className={`relative p-12 text-center cursor-pointer bg-gradient-to-br ${genre.color} 
                          border-0 rounded-2xl overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.05]`}
                      >
                        <Icon className="mx-auto mb-4 h-12 w-12 text-white drop-shadow-xl" />
                        <h3 className="text-3xl font-extrabold text-white drop-shadow-2xl">{genre.name}</h3>
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

      {/* FOOTER */}
      <footer
        className="py-10 border-t"
        style={{
          background: "var(--footer-bg)",
          color: "var(--footer-fg)"
        }}
      >
        <div className="text-center text-xs opacity-70">
          © {new Date().getFullYear()} Harmonica • All rights reserved.
        </div>
      </footer>
    </div>
  );
}
