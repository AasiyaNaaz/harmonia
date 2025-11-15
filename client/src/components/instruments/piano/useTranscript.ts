// useTranscript.ts
import { useCallback, useState } from "react";

export type TranscriptEntry = {
  id: string;
  midi: number;
  noteName: string;
  start: number;   // seconds relative to session start
  duration: number; // seconds
};

export default function useTranscript() {
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const add = useCallback((e: Omit<TranscriptEntry, "id">) => {
    setEntries((s) => [...s, { ...e, id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}` }]);
  }, []);
  const remove = useCallback((id: string) => setEntries((s) => s.filter((x) => x.id !== id)), []);
  const clear = useCallback(() => setEntries([]), []);
  const update = useCallback((id: string, patch: Partial<TranscriptEntry>) => {
    setEntries((s) => s.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);
  const reorder = useCallback((from: number, to: number) => {
    setEntries((s) => {
      const copy = [...s];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  }, []);
    return {
    entries,
    add,
    remove,
    clear,
    setEntries,
    };
}
