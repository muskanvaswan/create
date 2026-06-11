"use client";

import { useState, useEffect, useRef } from "react";
import cn from "classnames";

type ResizeDirection = "nw" | "ne" | "sw" | "se";

export function GlassWindow({ children }: { children: React.ReactNode }) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0, direction: "" as ResizeDirection });
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (!mobile) {
        setSize((prev) => {
          const w = prev ? prev.width : Math.min(1300, window.innerWidth - 64);
          const h = prev ? prev.height : Math.min(820, window.innerHeight - 64);
          const newW = Math.min(w, window.innerWidth - 32);
          const newH = Math.min(h, window.innerHeight - 32);

          setPosition((prevPos) => {
            if (prevPos) {
              const maxLeft = window.innerWidth - 100;
              const maxTop = window.innerHeight - 100;
              return {
                x: Math.max(-newW + 100, Math.min(maxLeft, prevPos.x)),
                y: Math.max(0, Math.min(maxTop, prevPos.y)),
              };
            }
            return {
              x: (window.innerWidth - newW) / 2,
              y: (window.innerHeight - newH) / 2,
            };
          });

          return { width: newW, height: newH };
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onResizeMouseDown = (e: React.MouseEvent, direction: ResizeDirection) => {
    if (!size || !position) return;
    setIsResizing(true);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: position.x,
      y: position.y,
      w: size.width,
      h: size.height,
      direction,
    };
    e.preventDefault();
    e.stopPropagation();
  };

  const onWindowMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !position) return;

    // Drag from header area (top 56px)
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    if (clickY <= 56) {
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("a") ||
        target.closest("select") ||
        target.closest("[role='button']") ||
        target.closest(".flex.gap-2") // traffic lights container
      ) {
        return;
      }

      setIsDragging(true);
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        winX: position.x,
        winY: position.y,
      };
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartRef.current.mouseX;
      const deltaY = e.clientY - resizeStartRef.current.mouseY;
      const { direction, x, y, w, h } = resizeStartRef.current;

      let newWidth = w;
      let newHeight = h;
      let newLeft = x;
      let newTop = y;

      const minW = Math.min(1080, window.innerWidth - 32);
      const minH = 480;
      const maxW = window.innerWidth - 16;
      const maxH = window.innerHeight - 16;

      // Width & Left
      if (direction === "se" || direction === "ne") {
        newWidth = Math.max(minW, Math.min(maxW, w + deltaX));
      } else if (direction === "sw" || direction === "nw") {
        const computedWidth = w - deltaX;
        if (computedWidth < minW) {
          newWidth = minW;
          newLeft = x + (w - minW);
        } else if (computedWidth > maxW) {
          newWidth = maxW;
          newLeft = x + (w - maxW);
        } else {
          newWidth = computedWidth;
          newLeft = x + deltaX;
        }
      }

      // Height & Top
      if (direction === "se" || direction === "sw") {
        newHeight = Math.max(minH, Math.min(maxH, h + deltaY));
      } else if (direction === "nw" || direction === "ne") {
        const computedHeight = h - deltaY;
        if (computedHeight < minH) {
          newHeight = minH;
          newTop = y + (h - minH);
        } else if (computedHeight > maxH) {
          newHeight = maxH;
          newTop = y + (h - maxH);
        } else {
          newHeight = computedHeight;
          newTop = y + deltaY;
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newLeft, y: newTop });
    };

    const onMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      const newX = dragStartRef.current.winX + deltaX;
      const newY = Math.max(0, dragStartRef.current.winY + deltaY); // Keep title bar accessible

      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  // Add scroll event listener to track active scrolling elements
  useEffect(() => {
    const activeScrollbars = new Map<HTMLElement, NodeJS.Timeout>();

    const handleScroll = (e: Event) => {
      const target = e.target;
      if (!target || !(target instanceof HTMLElement)) return;
      if (target === window.document.documentElement) return;

      target.classList.add("is-scrolling");

      const existingTimeout = activeScrollbars.get(target);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        target.classList.remove("is-scrolling");
        activeScrollbars.delete(target);
      }, 800);

      activeScrollbars.set(target, timeout);
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      for (const timeout of activeScrollbars.values()) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const resizeCursor = isResizing
    ? (resizeStartRef.current.direction === "nw" || resizeStartRef.current.direction === "se"
      ? "cursor-nwse-resize"
      : "cursor-nesw-resize")
    : "";

  return (
    <div
      className={cn(
        "h-full w-full p-0 sm:p-3 lg:p-5 relative overflow-hidden",
        isDragging && "cursor-grabbing select-none",
        isResizing && `${resizeCursor} select-none`
      )}
    >
      <div
        onMouseDown={onWindowMouseDown}
        style={!isMobile && size && position ? {
          width: `${size.width}px`,
          height: `${size.height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
        } : undefined}
        className={cn(
          "overflow-hidden rounded-none bg-[#f2f2f7] dark:bg-black sm:bg-[#f4f4f3]/75 sm:dark:bg-[#251d31]/70 sm:shadow-[0_45px_115px_-15px_rgba(0,0,0,0.5),0_15px_45px_-10px_rgba(0,0,0,0.3)] sm:dark:shadow-[0_45px_115px_-15px_rgba(0,0,0,0.85),0_15px_45px_-10px_rgba(0,0,0,0.5)] sm:ring-1 sm:ring-black/10 sm:backdrop-blur-2xl sm:dark:ring-white/10 sm:rounded-[1.4rem]",
          isMobile ? "w-full h-full" : "absolute shrink-0"
        )}
      >
        {children}

        {/* Resize corner handles */}
        {!isMobile && (
          <>
            {/* Top-Left */}
            <div
              onMouseDown={(e) => onResizeMouseDown(e, "nw")}
              className="absolute top-0 left-0 h-3 w-3 cursor-nwse-resize z-50 select-none"
              title="Resize from top-left"
            />
            {/* Top-Right */}
            <div
              onMouseDown={(e) => onResizeMouseDown(e, "ne")}
              className="absolute top-0 right-0 h-3 w-3 cursor-nesw-resize z-50 select-none"
              title="Resize from top-right"
            />
            {/* Bottom-Left */}
            <div
              onMouseDown={(e) => onResizeMouseDown(e, "sw")}
              className="absolute bottom-0 left-0 h-3 w-3 cursor-nesw-resize z-50 select-none"
              title="Resize from bottom-left"
            />
            {/* Bottom-Right */}
            <div
              onMouseDown={(e) => onResizeMouseDown(e, "se")}
              className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize z-50 select-none flex items-end justify-end group p-0.5"
              title="Resize from bottom-right"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className="text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors"
              >
                <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="8" y1="5" x2="5" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
