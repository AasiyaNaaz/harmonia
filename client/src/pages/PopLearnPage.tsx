// src/pages/PopLearnPage.tsx
import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavbarIcon from "@/components/NavbarIcon";

type Instrument = {
  name: string;
  funFact: string;
  image: string;
  guidelines: string;
  sound: string;
  category: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
};

const instruments: Instrument[] = [
  {
    name: "Guitar",
    funFact:
      "The electric guitar revolutionized pop music in the 1950s and still defines many chart hits.",
    image: "/assets/guitar.png",
    guidelines: `Guitar Learning Guide:
1. Learn basic open chords (G, C, D, Em).
2. Practice switching between chords slowly.
3. Add simple down-up strumming patterns.
4. Try playing along with your favorite pop song.`,
    sound: "/assets/sounds/guitar.mp3",
    category: "Strings",
  },
  {
    name: "Piano",
    funFact:
      "Many iconic pop ballads begin with a simple, emotional piano progression.",
    image: "/assets/keyboard.png",
    guidelines: `Piano Learning Guide:
1. Understand the layout of white and black keys.
2. Practice C, F, G major chords.
3. Learn to play chords in the left hand, melody in the right.
4. Use a metronome to keep your timing steady.`,
    sound: "/assets/sounds/piano.mp3",
    category: "Keys",
  },
  {
    name: "Drums",
    funFact:
      "The drum groove is what makes your head nod and your feet move in most pop tracks.",
    image: "/assets/drums.png",
    guidelines: `Drums Learning Guide:
1. Learn the basic pop/rock beat (kick on 1 & 3, snare on 2 & 4).
2. Practice coordinating hands and feet slowly.
3. Add hi-hat eighth notes for energy.
4. Experiment with small fills every 4 or 8 bars.`,
    sound: "/assets/sounds/drums.mp3",
    category: "Rhythm",
  },
  {
    name: "Microphone",
    funFact:
      "Modern condenser microphones capture every nuance of a pop singer’s voice.",
    image: "/assets/microphone.png",
    guidelines: `Microphone Guide:
1. Stand 10–15 cm away from the mic.
2. Use a pop filter to avoid harsh 'p' and 'b' sounds.
3. Keep your voice relaxed and supported with good breathing.
4. Move slightly back when singing louder to avoid distortion.`,
    sound: "/assets/sounds/microphone.mp3",
    category: "Voice",
  },
  {
    name: "Synthesizer",
    funFact:
      "Synths defined the sound of 80s pop and are still crucial in modern electronic pop.",
    image: "/assets/synthesizer.png",
    guidelines: `Synthesizer Learning Guide:
1. Learn basic waveforms (sine, square, saw).
2. Experiment with filter cutoff and resonance.
3. Use envelopes to shape attack and release of notes.
4. Layer pads, leads, and basses for rich pop textures.`,
    sound: "/assets/sounds/synthesizer.mp3",
    category: "Electronic",
  },
  {
    name: "Saxophone",
    funFact:
      "Sax solos give pop and funk songs a soulful, expressive character.",
    image: "/assets/saxophone.png",
    guidelines: `Saxophone Learning Guide:
1. Learn correct embouchure (mouth position) on the mouthpiece.
2. Practice long tones to build control.
3. Memorize a simple major scale.
4. Try copying a short sax riff from a pop or funk song.`,
    sound: "/assets/sounds/saxophone.mp3",
    category: "Winds",
  },
];

const categories = ["All", "Strings", "Keys", "Rhythm", "Voice", "Electronic", "Winds"];

const popFacts: string[] = [
  "Pop music focuses on catchy melodies and hooks that stay in your head after one listen.",
  "Most pop songs use simple, repeated chord progressions like I–V–vi–IV that feel familiar and satisfying.",
  "The chorus is usually the ‘heart’ of the song – it’s where the main message and hook live.",
  "Production is a huge part of pop: layered vocals, effects, synths, and beats give songs their polished sound.",
  "Pop blends influences from many styles: R&B, electronic, rock, hip-hop, and even classical.",
  "Lyrics in pop often talk about love, emotions, friendships, and real-life experiences people relate to.",
  "A strong rhythmic groove (often with the snare on beats 2 & 4) makes pop songs feel danceable.",
  "Modern pop is built in DAWs (Digital Audio Workstations) like Ableton, FL Studio, and Logic Pro.",
];

const quizQuestions: QuizQuestion[] = [
  {
    question: "In most pop songs, which beats are the snare usually on?",
    options: ["1 and 3", "2 and 4", "Only on 1", "Every beat"],
    correctIndex: 1,
    explanation:
      "Pop and rock often emphasize the snare on beats 2 and 4, creating that classic head-nod groove.",
    hint: "Think of clapping along with a crowd: you usually clap on 2 and 4.",
  },
  {
    question: "Which chord progression is famous for being used in MANY pop hits?",
    options: ["I–ii–iii–IV", "I–V–vi–IV", "I–IV–V–I", "vi–iii–ii–V"],
    correctIndex: 1,
    explanation:
      "I–V–vi–IV is the classic four-chord progression heard in countless modern pop songs.",
    hint: "It’s often called the ‘four-chord progression’.",
  },
  {
    question: "What is usually the most memorable part of a pop song?",
    options: ["Intro", "Bridge", "Chorus", "Guitar solo"],
    correctIndex: 2,
    explanation:
      "The chorus is designed to be the most memorable and is often repeated several times.",
    hint: "It’s the part everyone sings along to.",
  },
  {
    question: "Which element helps a pop song feel polished and modern?",
    options: ["Random noise", "Unmixed tracks", "Layered production", "Off-beat rhythm"],
    correctIndex: 2,
    explanation:
      "Layered production with carefully balanced sounds makes pop tracks feel big and polished.",
    hint: "Think of stacked vocals, synths, and effects.",
  },
];

export default function PopLearnPage() {
  // theme state: 'light' | 'dark' persisted to localStorage and toggles the root `dark` class
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    // fallback to system
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch {}
    if (typeof document !== 'undefined') {
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  const [selectedInst, setSelectedInst] = useState<Instrument | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [showCourse, setShowCourse] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const visibleInstruments =
    activeCategory === "All"
      ? instruments
      : instruments.filter((inst) => inst.category === activeCategory);

  const toggleAudio = (sound: string) => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = sound;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const closeModal = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setSelectedInst(null);
  };

  const handleStartCourse = () => {
    setShowCourse(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setIsAnswerCorrect(null);
    setScore(0);
    setShowHint(false);
    setQuizFinished(false);
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (quizFinished) return;

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const correct = optionIndex === currentQuestion.correctIndex;

    setSelectedAnswerIndex(optionIndex);
    setIsAnswerCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    const isLast = currentQuestionIndex === quizQuestions.length - 1;

    if (isLast) {
      setQuizFinished(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setIsAnswerCorrect(null);
      setShowHint(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setIsAnswerCorrect(null);
    setScore(0);
    setShowHint(false);
    setQuizFinished(false);
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const progressPercent = useMemo(() => {
    return Math.round(((currentQuestionIndex + (selectedAnswerIndex !== null ? 1 : 0)) / quizQuestions.length) * 100);
  }, [currentQuestionIndex, selectedAnswerIndex]);

  return (
    <>
      <NavbarIcon />

  <div className="px-6 py-12 max-w-7xl mx-auto pt-24 font-sans">
        {/* Header + CTA */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-purple mb-2 leading-tight dark:text-white">
                Pop Lab — Learn & Play
              </h1>
              <p className="text-purple-600 max-w-xl text-lg dark:text-gray-300">
                Explore the instruments behind chart-topping pop, listen to each one, and sharpen your
                ears with short, rewarding quizzes.
              </p>
            </div>

            <div className="ml-4 flex flex-col items-end">
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
                  aria-label="Toggle theme"
                  className="px-3 py-2 rounded-xl bg-gray-100 text-sm dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                >
                  {theme === 'light' ? '🌞 Light' : '🌙 Dark'}
                </button>
                <button
                  onClick={handleStartCourse}
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 text-white font-semibold shadow-lg hover:shadow-2xl hover:scale-[1.03] active:scale-95 transition-transform"
                >
                  Learn with Quizzes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pop Facts + Quiz Game Section */}
        {showCourse && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-8"
          >
            {/* POP FACTS / SCROLLABLE COOL CARD */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl p-6 shadow-2xl bg-gradient-to-br from-pink-50 via-indigo-50 to-sky-50 overflow-hidden border border-purple-100"
            >
              <div className="absolute -top-10 -right-6 w-32 h-32 rounded-full bg-pink-400/30 blur-3xl" />
              <div className="absolute -bottom-8 -left-10 w-40 h-40 rounded-full bg-purple-500/30 blur-3xl" />

              <div className="relative">
                <h2 className="text-2xl font-extrabold text-purple-900 mb-2 flex items-center gap-2">
                  Pop Universe
                  <span className="text-xs bg-white/70 rounded-full px-3 py-1 text-pink-600 font-semibold">
                    Fun Facts & Power Points
                  </span>
                </h2>
                <p className="text-sm text-purple-800 mb-4">
                  Scroll through to understand what makes pop music so addictive and powerful.
                </p>

                <div className="mt-3 max-h-64 overflow-y-auto pr-2 space-y-3 custom-scroll">
                  {popFacts.map((fact, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * index, duration: 0.45 }}
                      className="bg-white/90 rounded-2xl px-4 py-3 border border-purple-50 shadow-sm hover:shadow-md backdrop-blur-sm"
                    >
                      <p className="text-sm text-purple-900 leading-relaxed">
                        <span className="inline-block font-semibold text-pink-500 mr-2">{`#${index + 1}`}</span>
                        {fact}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* QUIZ GAME PANEL */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-purple-900">
                    Pop Quiz Arena
                  </h3>
                  <p className="text-xs text-purple-600">
                    Answer questions based on what you’ve learned about pop.
                  </p>
                </div>
                <div className="flex flex-col items-end text-sm">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                      Score: {score}
                    </span>
                    <span className="text-xs text-purple-500">/ {quizQuestions.length}</span>
                  </div>
                  <span className="mt-1 text-[12px] text-gray-500">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                </div>
              </div>

              <div className="mt-2 p-4 rounded-2xl bg-gradient-to-r from-white via-purple-50 to-white border border-purple-50">
                <div className="mb-3">
                  <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Progress: {progressPercent}%</div>
                </div>
                
                <p className="text-sm font-semibold text-purple-900 mb-2">
                  {currentQuestion.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedAnswerIndex === idx;
                    const isCorrect = idx === currentQuestion.correctIndex;
                    let stateClasses = "border-purple-100 bg-white hover:border-purple-300";

                    if (selectedAnswerIndex !== null) {
                      if (isSelected && isAnswerCorrect) {
                        stateClasses = "border-emerald-500 bg-emerald-50 text-emerald-800";
                      } else if (isSelected && !isAnswerCorrect) {
                        stateClasses = "border-rose-500 bg-rose-50 text-rose-800";
                      } else if (isCorrect) {
                        stateClasses = "border-emerald-400 bg-emerald-50 text-emerald-800";
                      } else {
                        stateClasses = "border-purple-100 bg-white text-purple-800 opacity-70";
                      }
                    }

                    return (
                      <motion.button
                        key={opt}
                        disabled={selectedAnswerIndex !== null}
                        onClick={() => handleQuizAnswer(idx)}
                        whileHover={{ scale: selectedAnswerIndex === null ? 1.02 : 1 }}
                        whileTap={{ scale: 0.98 }}
                        className={`text-left px-4 py-3 rounded-xl text-sm border transition shadow-sm ${stateClasses}`}
                      >
                        <div className="font-medium text-purple-900">{opt}</div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowHint((prev) => !prev)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    {showHint ? "Hide Hint" : "Need a Hint?"}
                  </button>

                  {selectedAnswerIndex !== null && !quizFinished && (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-500 text-white hover:bg-pink-600 transition"
                    >
                      {currentQuestionIndex === quizQuestions.length - 1
                        ? "Finish Quiz"
                        : "Next Question"}
                    </button>
                  )}

                  {quizFinished && (
                    <button
                      type="button"
                      onClick={handleRestartQuiz}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition"
                    >
                      Play Again
                    </button>
                  )}
                </div>

                {showHint && (
                  <p className="mt-2 text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                    💡 <span className="font-semibold">Hint:</span> {currentQuestion.hint}
                  </p>
                )}

                {selectedAnswerIndex !== null && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                  >
                    {currentQuestion.explanation}
                  </motion.p>
                )}

                {quizFinished && (
                  <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-3 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-white border border-emerald-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🎉</div>
                      <div className="text-sm font-semibold text-emerald-800">
                        Quiz Finished — {score} / {quizQuestions.length}
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-700">
                      {score === quizQuestions.length
                        ? "Perfect score! You're a pop expert — try a harder set next."
                        : score >= quizQuestions.length / 2
                        ? "Nice work! You’re getting the hang of pop." 
                        : "Good start — review the Pop Facts and try again to improve."}
                    </div>

                    {/* small confetti replace: animated dots */}
                    <div className="mt-3 flex gap-1">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{ y: -6, opacity: 0 }}
                          animate={{ y: [0, -12, 0], opacity: [1, 0.9, 1] }}
                          transition={{ delay: i * 0.03, duration: 0.9 }}
                          className={`w-2 h-2 rounded-full ${
                            i % 4 === 0 ? 'bg-pink-500' : i % 3 === 0 ? 'bg-indigo-500' : 'bg-emerald-400'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                activeCategory === cat
                  ? "bg-purple-700 text-white border-purple-700 shadow-md"
                  : "bg-white text-purple-800 border-purple-200 hover:border-purple-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Instruments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {visibleInstruments.map((inst) => (
            <motion.div
              key={inst.name}
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  setIsPlaying(false);
                }
                setSelectedInst(inst);
              }}
              tabIndex={0}
              whileHover={{ scale: 1.03, translateY: -6 }}
              className="shadow-lg cursor-pointer border border-purple-200 rounded-2xl p-6 hover:shadow-2xl transition bg-white"
            >
              <img
                src={inst.image}
                alt={inst.name}
                className="rounded-xl w-full h-44 object-cover border border-purple-50"
              />

              <h2 className="mt-4 text-xl font-semibold text-purple-900">
                {inst.name}
              </h2>

              <p className="text-xs mt-1 text-purple-500 uppercase tracking-wide">
                {inst.category}
              </p>

              <p className="text-purple-700 italic mt-2 text-sm leading-relaxed">
                {inst.funFact}
              </p>

              <button
                className="mt-4 px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-900 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  if (audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }
                  setSelectedInst(inst);
                }}
              >
                Learn More
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedInst && (
          <motion.div
            initial={{ opacity: 0, y: "-8%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-8%" }}
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
          >
            <motion.div className="bg-white rounded-2xl p-6 max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-purple-50"
                        initial={{ scale: 0.98 }} animate={{ scale: 1 }}>
              <div className="flex items-start gap-4">
                <img src={selectedInst.image} alt={selectedInst.name} className="w-28 h-28 object-cover rounded-lg border" />
                <div>
                  <h2 className="text-2xl font-bold text-purple-900 mb-1">
                    {selectedInst.name}
                  </h2>
                  <p className="text-sm text-purple-600 mb-3">{selectedInst.category}</p>
                  <p className="text-purple-800 whitespace-pre-line mb-4 leading-relaxed">
                    {selectedInst.guidelines}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      className={`px-5 py-2 rounded-lg text-white text-sm font-semibold ${isPlaying ? 'bg-indigo-700' : 'bg-purple-700'} hover:opacity-95 transition`}
                      onClick={() => toggleAudio(selectedInst.sound)}
                    >
                      {isPlaying ? 'Pause' : `Play ${selectedInst.name}`}
                    </button>

                    <div className="flex items-end gap-1 h-6" aria-hidden="true">
                      <motion.span
                        animate={{ scaleY: isPlaying ? [0.6, 1.4, 0.8] : 0.6 }}
                        transition={{ repeat: Infinity, duration: 0.9, repeatDelay: 0.2 }}
                        className="w-1.5 h-4 bg-pink-400 rounded-full"
                      />
                      <motion.span
                        animate={{ scaleY: isPlaying ? [0.8, 1.6, 0.7] : 0.8 }}
                        transition={{ repeat: Infinity, duration: 0.85, repeatDelay: 0.12 }}
                        className="w-1.5 h-5 bg-purple-500 rounded-full"
                      />
                      <motion.span
                        animate={{ scaleY: isPlaying ? [0.5, 1.2, 0.6] : 0.5 }}
                        transition={{ repeat: Infinity, duration: 0.95, repeatDelay: 0.18 }}
                        className="w-1.5 h-3 bg-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <button
                  className="absolute top-4 right-4 text-2xl font-bold text-gray-700 hover:text-gray-900"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
            </motion.div>

            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} preload="auto" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
