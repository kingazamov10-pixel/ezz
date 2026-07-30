"use client";

import { useEffect, useState } from "react";

export function Timer({
  seconds,
  running,
  onExpire,
}: {
  seconds: number;
  running: boolean;
  onExpire?: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          onExpire?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onExpire]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const low = remaining <= 30;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 font-mono text-sm font-semibold ${
        low ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
      }`}
    >
      ⏱ {m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
    </span>
  );
}
