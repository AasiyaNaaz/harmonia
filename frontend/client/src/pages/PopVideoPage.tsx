import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function PopVideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setLocation] = useLocation();
  const [muted, setMuted] = useState(false); // 🔊 default unmuted

  function handleEnded() {
    setLocation("/genre/pop/info");
  }

  function handleSkip() {
    setLocation("/genre/pop/info");
  }

  function toggleMute() {
    setMuted(!muted);
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center z-40">

      <video
        ref={videoRef}
        src="/assets/pop_intro.mp4"
        muted={muted}
        autoPlay
        playsInline
        onEnded={handleEnded}
        className="w-full h-full object-cover"
      />

      <div className="absolute top-8 right-6 space-x-4 z-50">
        <button
          onClick={toggleMute}
          className="bg-white bg-opacity-60 rounded px-3 py-1 text-sm"
        >
          {muted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={handleSkip}
          className="bg-white bg-opacity-60 rounded px-3 py-1 text-sm"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
