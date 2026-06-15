"use client";

/**
 * PolishMonitor — explicit component-level tracking for Polish.
 *
 * Drop this around any element you want to monitor. It auto-detects what can
 * be tracked based on child element types, then captures:
 *
 *  • hover   — pointer dwell time (≥200ms), value = ms
 *  • component_view — time in the viewport per visit, value = ms, meta includes:
 *      width, height (px), scrollDepth (% of component scrolled through),
 *      views (how many times it entered the viewport)
 *
 * Child clicks/rage/dead are attributed automatically via data-component
 * and the existing global Polish click capture — no extra wiring needed.
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

/** Find the nearest ancestor that scrolls on the y-axis. */
function findScrollParent(el: HTMLElement): HTMLElement | Window {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const { overflowY } = window.getComputedStyle(node);
    if (/auto|scroll/.test(overflowY) && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return window;
}

export function PolishMonitor({ name, children, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const hoverStart = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Auto-detect what's trackable and annotate for devtools.
    const hasButtons = el.querySelectorAll("button").length > 0;
    const hasLinks = el.querySelectorAll("a").length > 0;
    const kinds: string[] = ["hover", "view"];
    if (hasButtons) kinds.push("click");
    if (hasLinks) kinds.push("link");
    el.dataset.polishTracks = kinds.join(",");

    // ── Hover tracking ──────────────────────────────────────────────────────
    const onEnter = () => { hoverStart.current = Date.now(); };
    const onLeave = () => {
      if (hoverStart.current === null) return;
      const ms = Date.now() - hoverStart.current;
      hoverStart.current = null;
      if (ms < 200) return;
      window.__polishTrack?.({ type: "hover", component: name, value: ms });
    };

    // ── Viewport / focus tracking ───────────────────────────────────────────
    // visibleSince: when this viewport visit started (null = not visible)
    // totalMs: accumulated visible time across all viewport visits
    // maxScrollDepth: highest scroll-through % seen (0–100)
    // maxHeightPx/maxWidthPx: largest rendered box seen while laid out
    // viewCount: how many times the component entered the viewport
    let visibleSince: number | null = null;
    let totalMs = 0;
    let maxScrollDepth = 0;
    let maxHeightPx = 0;
    let maxWidthPx = 0;
    let viewCount = 0;

    // Track scroll-through % and the element's rendered size *while it's laid
    // out*. getBoundingClientRect returns the full box (not clipped to the
    // viewport), so it captures the element's true height even when only part
    // is on screen — and reading it here, rather than el.offsetHeight at emit
    // time, avoids the 0px we'd otherwise get when emitView fires during React
    // teardown (unmount / name change).
    // Scroll-depth formula: (viewportHeight - componentTop) / componentHeight,
    // clamped 0–100. Reaches 100% when the component's bottom is at the
    // viewport bottom.
    const refreshScrollDepth = () => {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) return;
      if (rect.height > maxHeightPx) maxHeightPx = rect.height;
      if (rect.width > maxWidthPx) maxWidthPx = rect.width;
      const pct = Math.max(0, Math.min(100, Math.round(
        ((window.innerHeight - rect.top) / rect.height) * 100,
      )));
      if (pct > maxScrollDepth) maxScrollDepth = pct;
    };

    // Flush accumulated viewport time as a component_view event.
    // Called when the component leaves the viewport or the effect cleans up.
    const emitView = () => {
      if (visibleSince !== null) {
        totalMs += Date.now() - visibleSince;
        visibleSince = null;
      }
      if (totalMs < 500) return; // ignore flashes shorter than half a second
      window.__polishTrack?.({
        type: "component_view",
        component: name,
        value: totalMs,
        meta: {
          width: Math.round(maxWidthPx),
          height: Math.round(maxHeightPx),
          scrollDepth: maxScrollDepth,
          views: viewCount,
        },
      });
      totalMs = 0;
      maxScrollDepth = 0;
      maxHeightPx = 0;
      maxWidthPx = 0;
      viewCount = 0;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (visibleSince === null) {
              visibleSince = Date.now();
              viewCount++;
            }
            refreshScrollDepth();
          } else {
            if (visibleSince !== null) {
              totalMs += Date.now() - visibleSince;
              visibleSince = null;
            }
            if (totalMs >= 500) emitView();
          }
        }
      },
      { threshold: [0, 0.1, 0.5, 1.0] },
    );
    observer.observe(el);

    const scrollParent = findScrollParent(el);
    scrollParent.addEventListener("scroll", refreshScrollDepth, { passive: true } as EventListenerOptions);

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      emitView(); // flush remaining time on unmount / name change
      observer.disconnect();
      scrollParent.removeEventListener("scroll", refreshScrollDepth);
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
