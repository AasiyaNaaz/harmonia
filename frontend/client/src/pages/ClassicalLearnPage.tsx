import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavbarIcon from "@/components/NavbarIcon";
import Navigation from "@/components/Navigation";

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

// Instruments you requested with example placeholders for images and sounds
const instruments: Instrument[] = [
  {
    name: "Mridangam",
    funFact:
      "The Mridangam is the primary percussion instrument in Carnatic music, known for its rich tonal quality and rhythmic complexity.",
    image: "/assets/mridangam.png",
    guidelines: `Mridangam Learning Guide:
1. Master finger placement and basic strokes (Tha, Thom, Nam).
2. Practice Adi Tala and other rhythmic cycles.
3. Develop coordination between hands.
4. Integrate with melodic accompanists during practice.`,
    sound: "/assets/mridangam.mp3",
    category: "Rhythm",
  },
  {
    name: "Flute",
    funFact:
      "The bamboo flute has been a soulful voice in Carnatic and Hindustani music for centuries.",
    image: "/assets/flute.png",
    guidelines: `Flute Learning Guide:
1. Learn breath control and embouchure basics.
2. Start practicing major scales and simple ragas.
3. Work on Gamakas and expression.
4. Familiarize with classical flute compositions.`,
    sound: "/assets/flute.mp3",
    category: "Winds",
  },
  {
    name: "Nadaswaram",
    funFact:
      "Nadaswaram is a traditional temple instrument, delivering powerful and vibrant sound.",
    image: "/assets/nadaswaram.png",
    guidelines: `Nadaswaram Learning Guide:
1. Master continuous breath control for sustained notes.
2. Practice fingerings and basic ragas.
3. Learn ornamentations and complex rhythmic patterns.
4. Perform alongside Mridangam and vocalists for synergy.`,
    sound: "/assets/nadaswaram.mp3",
    category: "Winds",
  },
  {
    name: "Veena",
    funFact:
      "The Veena is one of the oldest Indian string instruments, known for its deep, resonant tone and majestic presence.",
    image: "/assets/veena.png",
    guidelines: `Veena Learning Guide:
1. Learn the Saraswati Veena posture and finger positioning.
2. Practice plucking technique (mezhu, meetu).
3. Start with basic varnams and simple ragas.
4. Master gamakas unique to Carnatic music.`,
    sound: "/assets/veena.mp3",
    category: "Strings",
  },
  {
    name: "Tanpura",
    funFact:
      "Tanpura provides the drone foundation essential to Indian classical music performances.",
    image: "/assets/tanpura.png",
    guidelines: `Tanpura Learning Guide:
1. Tune the strings properly to the raga's tonic note.
2. Practice consistent plucking patterns.
3. Learn use of volume and pressure for tonal color.
4. Understand its role in supporting melody.`,
    sound: "/assets/tanpura.mp3",
    category: "Drone",
  },

  

  {
    name: "Manjira",
    funFact:
      "Manjira are small hand cymbals used in devotional and folk music, producing a bright rhythmic jingle.",
    image: "/assets/manjira.png",
    guidelines: `Manjira Learning Guide:
1. Learn basic tapping patterns and timing.
2. Practice accompanying bhajans and folk rhythms.
3. Work on speed and clarity of sound.
4. Combine with Tabla or Mridangam for ensemble practice.`,
    sound: "/assets/manjira.mp3",
    category: "Rhythm",
  },
];


// Sample quiz questions relevant for classical music basics
const quizQuestions: QuizQuestion[] = [
  {
    question: "What is the primary rhythmic cycle in Carnatic music?",
    options: ["Adi Tala", "Teental", "Dadra", "Rag Taal"],
    correctIndex: 0,
    explanation: "Adi Tala is the most common rhythm cycle in Carnatic music.",
    hint: "It has 8 beats.",
  },
  {
    question: "Which instrument provides the drone in classical performances?",
    options: ["Flute", "Mridangam", "Tanpura", "Veena"],
    correctIndex: 2,
    explanation: "Tanpura gives the continuous drone.",
    hint: "Its job is to maintain sruti.",
  },
  {
    question: "The Mridangam is primarily a:",
    options: ["Wind Instrument", "String Instrument", "Percussion Instrument", "Keyboard"],
    correctIndex: 2,
    explanation: "Mridangam is a percussion instrument.",
    hint: "It is played by striking.",
  },
  {
    question: "Which of the following is a traditional South Indian wind instrument?",
    options: ["Nadaswaram", "Guitar", "Clarinet", "Harmonium"],
    correctIndex: 0,
    explanation: "Nadaswaram is a powerful temple wind instrument.",
    hint: "Often used in weddings.",
  },
  {
    question: "Which classical instrument is known for its deep and majestic tone?",
    options: ["Sitar", "Veena", "Tabla", "Manjira"],
    correctIndex: 1,
    explanation: "Veena has a warm, majestic tonal quality.",
    hint: "Saraswati is often depicted holding it.",
  },
  {
    question: "Manjira belongs to which family of instruments?",
    options: ["Wind", "String", "Percussion", "Electronic"],
    correctIndex: 2,
    explanation: "Manjira are small percussive cymbals.",
    hint: "They keep rhythm in bhajans.",
  },
  {
    question: "What does Tanpura primarily support during a performance?",
    options: ["Melody", "Sruti/Drone", "Percussion", "Tempo"],
    correctIndex: 1,
    explanation: "Tanpura maintains the drone (sruti).",
    hint: "It never plays a tune.",
  },
];


const categories = ["All", "Rhythm", "Winds", "Drone"];

export default function ClassicalLearnPage() {
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
    if (showCourse) {
      setShowCourse(false);
      return;
    }

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

    if (correct) setScore((prev) => prev + 1);
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
    return Math.round(
      ((currentQuestionIndex + (selectedAnswerIndex !== null ? 1 : 0)) /
        quizQuestions.length) *
        100
    );
  }, [currentQuestionIndex, selectedAnswerIndex]);

  return (
    <>
      <Navigation />

      <div className="px-6 py-12 max-w-7xl mx-auto pt-24 font-sans">
        {/* Header + CTA */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-yellow mb-2 leading-tight dark:text-white">
                Classical Lab — Learn & Play
              </h1>
              <p className="text-yellow-600 max-w-xl text-lg dark:text-gray-300">
                Explore classical instruments with audio samples and challenge your knowledge with quizzes.
              </p>
            </div>

            <div className="ml-4 flex flex-col items-end">
              <button
                onClick={handleStartCourse}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-yellow-500 via-red-700 to-red-900 text-white font-semibold shadow-lg hover:shadow-2xl hover:scale-[1.03] active:scale-95 transition-transform"
              >
                Learn with Quizzes
              </button>
            </div>
          </div>
        </div>

        {/* Facts + Quiz Section */}
        {showCourse && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-8"
          >
            {/* CLASSICAL FACTS / SCROLLABLE CARD */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl p-6 shadow-2xl bg-gradient-to-br from-yellow-50 via-red-50 to-red-100 overflow-hidden border border-yellow-100"
            >
              <div className="absolute -top-10 -right-6 w-32 h-32 rounded-full bg-yellow-400/30 blur-3xl" />
              <div className="absolute -bottom-8 -left-10 w-40 h-40 rounded-full bg-red-600/30 blur-3xl" />

              <div className="relative">
                <h2 className="text-2xl font-extrabold text-yellow-900 mb-2 flex items-center gap-2">
                  Classical Universe
                  <span className="text-xs bg-white/70 rounded-full px-3 py-1 text-yellow-600 font-semibold">
                    Fun Facts & Power Points
                  </span>
                </h2>
                <p className="text-sm text-yellow-800 mb-4">
                  Classical music is a rich tradition with deep emotional and structural complexity.
                </p>

                {/* Add more classical facts here if needed */}
              </div>
            </motion.div>

            {/* QUIZ GAME PANEL */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-yellow-100 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-yellow-900">
                    Classical Quiz Arena
                  </h3>
                  <p className="text-xs text-yellow-600">
                    Test your knowledge of classical music instruments and theory.
                  </p>
                </div>
                <div className="flex flex-col items-end text-sm">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                      Score: {score}
                    </span>
                    <span className="text-xs text-yellow-500">/ {quizQuestions.length}</span>
                  </div>
                  <span className="mt-1 text-[12px] text-gray-500">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                </div>
              </div>

              <div className="mt-2 p-4 rounded-2xl bg-gradient-to-r from-white via-yellow-50 to-white border border-yellow-100">
                <div className="mb-3">
                  <div className="h-2 bg-yellow-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 via-red-700 to-red-900 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Progress: {progressPercent}%</div>
                </div>
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  {currentQuestion.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedAnswerIndex === idx;
                    const isCorrect = idx === currentQuestion.correctIndex;
                    let stateClasses = "border-yellow-100 bg-white hover:border-yellow-300";

                    if (selectedAnswerIndex !== null) {
                      if (isSelected && isAnswerCorrect) {
                        stateClasses = "border-emerald-500 bg-emerald-50 text-emerald-800";
                      } else if (isSelected && !isAnswerCorrect) {
                        stateClasses = "border-rose-500 bg-rose-50 text-rose-800";
                      } else if (isCorrect) {
                        stateClasses = "border-emerald-400 bg-emerald-50 text-emerald-800";
                      } else {
                        stateClasses = "border-yellow-100 bg-white text-yellow-800 opacity-70";
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
                        <div className="font-medium text-yellow-900">{opt}</div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowHint((prev) => !prev)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    {showHint ? "Hide Hint" : "Need a Hint?"}
                  </button>

                  {selectedAnswerIndex !== null && !quizFinished && (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-600 text-white hover:bg-yellow-700 transition"
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
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                    >
                      Play Again
                    </button>
                  )}
                </div>

                {showHint && (
                  <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
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
                        ? "Perfect score! You're a classical music pro — try exploring other genres!"
                        : score >= quizQuestions.length / 2
                        ? "Great job! You have a solid grasp of classical music basics."
                        : "Keep practicing and review the material to improve your knowledge."}
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
                  ? "bg-yellow-700 text-white border-yellow-700 shadow-md"
                  : "bg-white text-yellow-800 border-yellow-300 hover:border-yellow-500"
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
              className="shadow-lg cursor-pointer border border-yellow-300 rounded-2xl p-6 hover:shadow-2xl transition bg-white"
            >
              <img
                src={inst.image}
                alt={inst.name}
                className="rounded-xl w-full h-44 object-cover border border-yellow-100"
              />

              <h2 className="mt-4 text-xl font-semibold text-yellow-900">
                {inst.name}
              </h2>

              <p className="text-xs mt-1 text-yellow-500 uppercase tracking-wide">
                {inst.category}
              </p>

              <p className="text-yellow-700 italic mt-2 text-sm leading-relaxed">
                {inst.funFact}
              </p>

              <button
                className="mt-4 px-4 py-2 bg-yellow-700 text-white rounded-lg text-sm font-medium hover:bg-yellow-900 transition"
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
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-yellow-100"
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
            >
              <div className="flex items-start gap-4">
                <img
                  src={selectedInst.image}
                  alt={selectedInst.name}
                  className="w-28 h-28 object-cover rounded-lg border"
                />
                <div>
                  <h2 className="text-2xl font-bold text-yellow-900 mb-1">
                    {selectedInst.name}
                  </h2>
                  <p className="text-sm text-yellow-700 mb-3">{selectedInst.category}</p>
                  <p className="text-yellow-800 whitespace-pre-line mb-4 leading-relaxed">
                    {selectedInst.guidelines}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      className={`px-5 py-2 rounded-lg text-white text-sm font-semibold ${
                        isPlaying ? "bg-red-700" : "bg-yellow-700"
                      } hover:opacity-95 transition`}
                      onClick={() => toggleAudio(selectedInst.sound)}
                    >
                      {isPlaying ? "Pause" : `Play ${selectedInst.name}`}
                    </button>

                    <div className="flex items-end gap-1 h-6" aria-hidden="true">
                      <motion.span
                        animate={{ scaleY: isPlaying ? [0.6, 1.4, 0.8] : 0.6 }}
                        transition={{ repeat: Infinity, duration: 0.9, repeatDelay: 0.2 }}
                        className="w-1.5 h-4 bg-yellow-400 rounded-full"
                      />
                      <motion.span
                        animate={{ scaleY: isPlaying ? [0.8, 1.6, 0.7] : 0.8 }}
                        transition={{ repeat: Infinity, duration: 0.85, repeatDelay: 0.12 }}
                        className="w-1.5 h-5 bg-yellow-500 rounded-full"
                      />
                      <motion.span
                        animate={{ scaleY: isPlaying ? [0.5, 1.2, 0.6] : 0.5 }}
                        transition={{ repeat: Infinity, duration: 0.95, repeatDelay: 0.18 }}
                        className="w-1.5 h-3 bg-yellow-600 rounded-full"
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
