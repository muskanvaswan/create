"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "./icons";

type Props = {
  src: string;
};

export function ListenButton({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  // Stop playback when navigating to another note.
  useEffect(() => {
    return () => audioRef.current?.pause();
  }, [src]);

  const toggle = async () => {
    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);
      audio.onplay = () => setPlaying(true);
      audioRef.current = audio;
    }
    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
      } catch {
        // Playback can fail if the file disappeared; leave the button idle.
      }
    } else {
      audioRef.current.pause();
    }
  };

  return (
    <button
      onClick={toggle}
      title={playing ? "Pause" : "Listen to this note"}
      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-gradient-to-b from-white/80 to-white/40 px-3 py-1 text-[13px] font-medium text-neutral-600 shadow-sm hover:text-neutral-900 dark:border-white/15 dark:from-white/[0.12] dark:to-white/[0.05] dark:text-neutral-300 dark:hover:text-white"
    >
      {playing ? (
        <PauseIcon className="h-[14px] w-[14px]" />
      ) : (
        <PlayIcon className="h-[14px] w-[14px]" />
      )}
      {playing ? "Pause" : "Listen"}
    </button>
  );
}
