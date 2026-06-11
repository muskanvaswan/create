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
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlaying(false);
    };
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
      className="group flex h-7 w-9 items-center justify-center rounded-full transition-all duration-200 ease-in-out hover:w-20 text-[13px] font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
    >
      {playing ? (
        <PauseIcon className="h-[14px] w-[14px] shrink-0" />
      ) : (
        <PlayIcon className="h-[14px] w-[14px] shrink-0" />
      )}
      <span className="max-w-0 overflow-hidden transition-all duration-200 ease-in-out whitespace-nowrap group-hover:max-w-[40px] group-hover:ml-1.5">
        {playing ? "Pause" : "Listen"}
      </span>
    </button>
  );
}
