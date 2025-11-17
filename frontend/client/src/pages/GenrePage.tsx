import React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";

interface GenreProps {
  genre: {
    name: string;
    gradient: string;
    history: string;
    characteristics: string[];
    artists: { name: string; bio: string }[];
    instruments?: { name: string; image: string; tutorial: string[] }[];
  };
}

export default function GenrePage({ genre }: GenreProps) {
  const [, setLocation] = useLocation();
  const isPop = genre.name.toLowerCase() === "pop";

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* ⭐ CLEAN HERO SECTION — FULLY UNIFORM & CENTERED */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[28rem] flex items-center justify-center text-center"
        style={{
          background:
            "linear-gradient(135deg, #0ea5e9 0%, #7c3aed 40%, #ec4899 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-20" />

        <div className="relative z-10 max-w-4xl px-6">
          <motion.h1
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-7xl font-extrabold text-white tracking-tight"
          >
            {genre.name.toUpperCase()}
          </motion.h1>

          <motion.p
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-white/90 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto"
          >
            {genre.history}
          </motion.p>
        </div>
      </motion.header>

      {/* ⭐ MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12 -mt-16">

        {/* ⭐ Learn Section — uniform, neat, fixed spacing */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-900 shadow-xl rounded-3xl p-10 border border-gray-100 dark:border-slate-800"
        >
          <h2 className="text-3xl font-bold mb-4">Learn</h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed max-w-3xl">
            Explore the foundations of pop music — rhythm, hooks, catchy melodies,
            production techniques, and iconic performance styles. Dive deeper into
            how pop culture shapes sound, visuals, and global trends.
          </p>
        </motion.section>

        {/* ⭐ Artists Section */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-10"
        >
          <h3 className="text-2xl font-semibold mb-4">Artists</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {genre.artists.map((artist, i) => (
              <motion.div
                key={artist.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl bg-white/60 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-md backdrop-blur-sm"
              >
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  {artist.name}
                </h4>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {artist.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ⭐ Bottom Buttons — clean and centered */}
        <div className="flex justify-center gap-6 mt-16">

          {isPop && (
            <button
              onClick={() => setLocation("/genre/pop/learn")}
              className="px-8 py-4 bg-purple-700 text-white rounded-xl text-lg font-semibold shadow-lg hover:bg-purple-900 transition"
            >
              Learn Pop Instruments
            </button>
          )}

          <button
            onClick={() => window.location.href = "http://localhost:8000/convert-page"}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold shadow-lg hover:bg-blue-800 transition"
          >
            Convert
          </button>
        </div>
      </main>
    </div>
  );
}
