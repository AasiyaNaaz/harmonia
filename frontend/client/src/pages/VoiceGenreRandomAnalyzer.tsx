import React, { useState, useRef } from "react";

const GENRES = [
  "Classical",
  "Carnatic",
  "Pop",
  "Rock",
  "Folk",
  "Hip-Hop",
  "Jazz",
  "Qawwali",
];

interface AnalysisResult {
  percentages: Record<string, number>;
  bestGenre: string;
  reasoning: string;
}

export default function VoiceGenreRandomAnalyzer() {
  const [recording, setRecording] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => generateRandomAnalysis();

      mediaRecorder.start();
      setRecording(true);
      setAnalysis(null);
    } catch (err) {
      alert("Please enable microphone access.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const generateRandomAnalysis = () => {
    const percentages: Record<string, number> = {};

    GENRES.forEach((genre) => {
      percentages[genre] = Math.floor(Math.random() * 81) + 20;
    });

    const bestGenre = Object.keys(percentages).reduce((a, b) =>
      percentages[a] > percentages[b] ? a : b
    );

    const reasoning = `Your vocal tone best aligns with **${bestGenre}** (${percentages[bestGenre]}%).`;

    setAnalysis({ percentages, bestGenre, reasoning });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#111827] via-[#1e1b4b] to-[#0f172a] text-white px-5 py-10 flex flex-col items-center">
      
      {/* Page Title */}
      <h1 className="text-4xl font-bold mb-3 text-center">
        Voice Genre Analyzer 🎤
      </h1>
      <p className="text-lg opacity-80 max-w-xl text-center mb-10">
        Record your voice and get an AI-style random genre match for fun.
      </p>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-10">
        <button
          onClick={startRecording}
          disabled={recording}
          className={`px-6 py-3 rounded-xl text-lg font-medium transition shadow-lg
            ${
              recording
                ? "bg-green-400/50 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
        >
          🎤 Start Recording
        </button>

        <button
          onClick={stopRecording}
          disabled={!recording}
          className={`px-6 py-3 rounded-xl text-lg font-medium transition shadow-lg
            ${
              !recording
                ? "bg-red-400/50 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
        >
          ⏹ Stop Recording
        </button>
      </div>

      {/* Result Box */}
      {analysis && (
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20">
          
          <h2 className="text-2xl font-semibold mb-6 text-center">
            🎧 Analysis Result
          </h2>

          {/* Progress Bars */}
          {Object.entries(analysis.percentages).map(([genre, percent]) => (
            <div key={genre} className="mb-5">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{genre}</span>
                <span className="font-medium">{percent}%</span>
              </div>

              <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-blue-400 rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          ))}

          {/* Best Genre */}
          <div className="mt-6 text-center">
            <h3 className="text-xl font-bold">Best Match</h3>
            <p className="text-lg mt-2 opacity-90">{analysis.reasoning}</p>
          </div>
        </div>
      )}
    </div>
  );
}
