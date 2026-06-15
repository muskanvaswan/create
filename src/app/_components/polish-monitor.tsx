"use client";

/**
 * PolishMonitor — explicit component-level tracking for Polish.
 *
 * Drop this around any element you want to monitor. It:
 *   1. Sets data-component so Polish attributes every child click to `name`.
 *   2. Detects what can be tracked based on child element types (buttons → clicks
 *      already captured globally; any area → hover dwell time tracked here).
 *   3. Emits "hover" events with dwell duration so you can see engagement on
 *      specific UI regions in the Polish dashboard.
 *
 * Usage:
 *   <PolishMonitor name="listen-button">
 *     <ListenButton src={src} />
 *   </PolishMonitor>
 */

import { useEffect, useRef } from "react";
import type { PolishEvent } from "../../polish/shared/types";

type TrackFn = (e: Omit<PolishEvent, "ts" | "path"> & Partial<Pick<PolishEvent, "ts" | "path">>) => void;

declare global {
  interface Window {
    __polishTrack?: TrackFn;
  }
}

type Props = {
  /** Name shown in the Polish dashboard — keep it kebab-case and stable. */
  name: string;
  children: React.ReactNode;
  className?: string;
};

export function PolishMonitor({ name, children, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const hoverStart = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Auto-detect what's trackable inside this wrapper.
    const hasButtons = el.querySelectorAll("button").length > 0;
    const hasLinks = el.querySelectorAll("a").length > 0;
    const trackableKinds: string[] = ["hover"];
    if (hasButtons) trackableKinds.push("click");
    if (hasLinks) trackableKinds.push("link");

    // Store on the element so devtools can inspect what's being tracked.
    el.dataset.polishTracks = trackableKinds.join(",");

    const onEnter = () => {
      hoverStart.current = Date.now();
    };

    const onLeave = () => {
      if (hoverStart.current === null) return;
      const ms = Date.now() - hoverStart.current;
      hoverStart.current = null;
      // Ignore accidental mouse passes — only record intentional hovers.
      if (ms < 200) return;
      window.__polishTrack?.({ type: "hover", component: name, value: ms });
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [name]);

  return (
    <span ref={ref} data-component={name} className={className}>
      {children}
    </span>
  );
}
