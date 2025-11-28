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

// Type for analysis result
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

  // Start recording
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
      alert("Please allow microphone permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // Generate random analysis
  const generateRandomAnalysis = () => {
    const percentages: Record<string, number> = {};

    GENRES.forEach((genre) => {
      percentages[genre] = Math.floor(Math.random() * 81) + 20; // 20–100
    });

    const bestGenre = Object.keys(percentages).reduce((a, b) =>
      percentages[a] > percentages[b] ? a : b
    );

    const reasoning = `🎶 Your voice matches best with ${bestGenre} (${percentages[bestGenre]}%).`;

    setAnalysis({ percentages, bestGenre, reasoning });
  };

  return (
    <div className="min-h-screen bg-blue-600 text-white flex flex-col items-center p-10 font-sans">
      <h1 className="text-4xl font-bold mb-4">Voice Genre Analyzer 🎤</h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Record your voice and get a fun random genre match.
      </p>

      {/* Buttons */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={startRecording}
          disabled={recording}
          className={`px-6 py-3 text-white rounded-lg text-lg transition
            ${
              recording
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
        >
          🎤 Start Recording
        </button>

        <button
          onClick={stopRecording}
          disabled={!recording}
          className={`px-6 py-3 text-white rounded-lg text-lg transition
            ${
              !recording
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
        >
          ⏹ Stop Recording
        </button>
      </div>

      {/* Result */}
      {analysis && (
        <div className="w-full max-w-2xl bg-white/20 rounded-xl p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-center text-2xl font-semibold mb-5">
            Analysis Result
          </h2>

          {Object.entries(analysis.percentages).map(([genre, percent]) => (
            <div key={genre} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">{genre}</span>
                <span>{percent}%</span>
              </div>

              <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-cyan-400 rounded-full"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          ))}

          <h3 className="text-xl font-bold mt-6">Best Fit Genre</h3>
          <p className="text-lg mt-2">{analysis.reasoning}</p>
        </div>
      )}
    </div>
  );
}
