// PianoVisualizer.tsx
import React, { useEffect, useRef } from "react";

type Props = {
  analyser: AnalyserNode | null;
  height?: number;
};

export default function PianoVisualizer({ analyser, height = 60 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!analyser) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = data[i] / 255;
        const h = v * canvas.height;
        ctx.fillStyle = `hsl(${120 - v * 120}, 100%, ${30 + v * 30}%)`;
        ctx.fillRect(x, canvas.height - h, barWidth, h);
        x += barWidth + 1;
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return <canvas ref={canvasRef} width={800} height={height} className="w-full" />;
}
