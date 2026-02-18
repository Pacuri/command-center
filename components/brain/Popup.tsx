"use client";

import { useRef, useEffect, useCallback, useState } from "react";

export interface PopupState {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  isFinder: boolean;
  title: string;
  titleIcon: string;
  breadcrumbs: Array<{ label: string; onClick?: () => void }>;
  canGoBack: boolean;
  canGoForward: boolean;
}

interface PopupProps {
  popup: PopupState;
  onClose: (id: string) => void;
  onBringToFront: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
  onBack: (id: string) => void;
  onForward: (id: string) => void;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

type DragMode = "move" | "resize-e" | "resize-s" | "resize-se" | "resize-w" | "resize-sw" | null;

const MIN_W = 320;
const MIN_H = 200;
const MIN_MAIN = 140;
const MIN_SIDE = 100;

export default function Popup({
  popup,
  onClose,
  onBringToFront,
  onMove,
  onResize,
  onBack,
  onForward,
  sidebar,
  children,
}: PopupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<DragMode>(null);
  const startRef = useRef({ mx: 0, my: 0, ox: 0, oy: 0, ow: 0, oh: 0 });
  const [splitPx, setSplitPx] = useState(220);
  const splitterRef = useRef<{ startX: number; startSplit: number } | null>(null);

  // ── Drag / Resize ──

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const s = startRef.current;
      const dx = e.clientX - s.mx;
      const dy = e.clientY - s.my;
      const mode = modeRef.current;
      if (mode === "move") {
        onMove(popup.id, s.ox + dx, s.oy + dy);
      } else if (mode === "resize-e") {
        onResize(popup.id, Math.max(MIN_W, s.ow + dx), s.oh);
      } else if (mode === "resize-s") {
        onResize(popup.id, s.ow, Math.max(MIN_H, s.oh + dy));
      } else if (mode === "resize-se") {
        onResize(popup.id, Math.max(MIN_W, s.ow + dx), Math.max(MIN_H, s.oh + dy));
      } else if (mode === "resize-w") {
        const newW = Math.max(MIN_W, s.ow - dx);
        const actualDx = s.ow - newW;
        onMove(popup.id, s.ox + actualDx, s.oy);
        onResize(popup.id, newW, s.oh);
      } else if (mode === "resize-sw") {
        const newW = Math.max(MIN_W, s.ow - dx);
        const actualDx = s.ow - newW;
        onMove(popup.id, s.ox + actualDx, s.oy);
        onResize(popup.id, newW, Math.max(MIN_H, s.oh + dy));
      }
    },
    [popup.id, onMove, onResize]
  );

  const handlePointerUp = useCallback(() => {
    modeRef.current = null;
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  function beginDrag(e: React.PointerEvent, mode: DragMode) {
    e.preventDefault();
    e.stopPropagation();
    onBringToFront(popup.id);
    modeRef.current = mode;
    startRef.current = { mx: e.clientX, my: e.clientY, ox: popup.x, oy: popup.y, ow: popup.w, oh: popup.h };
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  }

  // ── Splitter drag ──

  const handleSplitterMove = useCallback((e: PointerEvent) => {
    if (!splitterRef.current) return;
    const dx = e.clientX - splitterRef.current.startX;
    const newSplit = Math.max(MIN_SIDE, Math.min(400, splitterRef.current.startSplit - dx));
    setSplitPx(newSplit);
  }, []);

  const handleSplitterUp = useCallback(() => {
    splitterRef.current = null;
    document.removeEventListener("pointermove", handleSplitterMove);
    document.removeEventListener("pointerup", handleSplitterUp);
  }, [handleSplitterMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener("pointermove", handleSplitterMove);
      document.removeEventListener("pointerup", handleSplitterUp);
    };
  }, [handleSplitterMove, handleSplitterUp]);

  function beginSplitterDrag(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    splitterRef.current = { startX: e.clientX, startSplit: splitPx };
    document.addEventListener("pointermove", handleSplitterMove);
    document.addEventListener("pointerup", handleSplitterUp);
  }

  // ── Mouse back/forward (buttons 3 & 4) ──

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      if (e.button === 3) {
        e.preventDefault();
        if (popup.canGoBack) onBack(popup.id);
      } else if (e.button === 4) {
        e.preventDefault();
        if (popup.canGoForward) onForward(popup.id);
      }
    };
    el.addEventListener("mouseup", handler);
    return () => el.removeEventListener("mouseup", handler);
  }, [popup.id, popup.canGoBack, popup.canGoForward, onBack, onForward]);

  // ── Edge hit zones (6px inset) ──

  const EDGE = 6;
  const edgeStyle = (pos: React.CSSProperties, cursor: string): React.CSSProperties => ({
    position: "absolute",
    ...pos,
    cursor,
    zIndex: 2,
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: popup.x,
        top: popup.y,
        width: popup.w,
        height: popup.h,
        background: "#0d0d0d",
        border: "1px solid #1a1a1a",
        borderRadius: 6,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(74,222,128,0.1)",
        zIndex: popup.zIndex,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "popup-in 0.15s ease-out",
      }}
      onMouseDown={() => onBringToFront(popup.id)}
    >
      {/* Resize edges */}
      <div style={edgeStyle({ top: 0, right: 0, width: EDGE, height: "100%" }, "ew-resize")} onPointerDown={(e) => beginDrag(e, "resize-e")} />
      <div style={edgeStyle({ bottom: 0, left: 0, width: "100%", height: EDGE }, "ns-resize")} onPointerDown={(e) => beginDrag(e, "resize-s")} />
      <div style={edgeStyle({ bottom: 0, right: 0, width: EDGE * 2, height: EDGE * 2 }, "nwse-resize")} onPointerDown={(e) => beginDrag(e, "resize-se")} />
      <div style={edgeStyle({ top: 0, left: 0, width: EDGE, height: "100%" }, "ew-resize")} onPointerDown={(e) => beginDrag(e, "resize-w")} />
      <div style={edgeStyle({ bottom: 0, left: 0, width: EDGE * 2, height: EDGE * 2 }, "nesw-resize")} onPointerDown={(e) => beginDrag(e, "resize-sw")} />

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "7px 12px",
          background: "#111",
          borderBottom: "1px solid #1a1a1a",
          cursor: "move",
          flexShrink: 0,
          gap: 8,
          position: "relative",
          zIndex: 3,
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          beginDrag(e, "move");
        }}
      >
        {/* Close + nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => onClose(popup.id)}
            style={{
              width: 12, height: 12, borderRadius: "50%", border: "none",
              background: "#333", cursor: "pointer", padding: 0, transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#333")}
          />
          <div style={{ width: 1, height: 14, background: "#1a1a1a", margin: "0 2px" }} />
          <button
            onClick={() => { if (popup.canGoBack) onBack(popup.id); }}
            style={{
              fontSize: 13, color: popup.canGoBack ? "#666" : "#222",
              cursor: popup.canGoBack ? "pointer" : "default",
              padding: "0 4px", border: "none", background: "none",
              fontFamily: "inherit", transition: "color 0.1s", lineHeight: 1,
            }}
            onMouseEnter={(e) => { if (popup.canGoBack) e.currentTarget.style.color = "#4ade80"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = popup.canGoBack ? "#666" : "#222"; }}
          >
            ‹
          </button>
          <button
            onClick={() => { if (popup.canGoForward) onForward(popup.id); }}
            style={{
              fontSize: 13, color: popup.canGoForward ? "#666" : "#222",
              cursor: popup.canGoForward ? "pointer" : "default",
              padding: "0 4px", border: "none", background: "none",
              fontFamily: "inherit", transition: "color 0.1s", lineHeight: 1,
            }}
            onMouseEnter={(e) => { if (popup.canGoForward) e.currentTarget.style.color = "#4ade80"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = popup.canGoForward ? "#666" : "#222"; }}
          >
            ›
          </button>
        </div>

        {/* Title */}
        <div
          style={{
            flex: 1, fontSize: 12, color: "#888",
            display: "flex", alignItems: "center", gap: 6,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 14, flexShrink: 0 }}>{popup.titleIcon}</span>
          {popup.title}
        </div>
      </div>

      {/* Breadcrumb */}
      {popup.breadcrumbs.length > 1 && (
        <div
          style={{
            padding: "5px 14px", fontSize: 10, color: "#444",
            borderBottom: "1px solid #111",
            display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
          }}
        >
          {popup.breadcrumbs.map((crumb, i) => {
            const isLast = i === popup.breadcrumbs.length - 1;
            return (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {i > 0 && <span style={{ color: "#2a2a2a" }}>›</span>}
                <span
                  style={{
                    color: isLast ? "#888" : "#555",
                    cursor: isLast ? "default" : "pointer",
                    transition: "color 0.1s",
                  }}
                  onClick={() => !isLast && crumb.onClick?.()}
                  onMouseEnter={(e) => { if (!isLast) e.currentTarget.style.color = "#4ade80"; }}
                  onMouseLeave={(e) => { if (!isLast) e.currentTarget.style.color = "#555"; }}
                >
                  {crumb.label}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Main content */}
        <div
          style={{
            flex: 1, overflowY: "auto", padding: "8px 10px",
            minWidth: sidebar ? MIN_MAIN : 0,
          }}
        >
          {children}
        </div>

        {/* Draggable splitter + sidebar */}
        {sidebar && (
          <>
            <div
              style={{
                width: 5, flexShrink: 0, cursor: "col-resize",
                background: "transparent", position: "relative", zIndex: 1,
              }}
              onPointerDown={beginSplitterDrag}
            >
              <div style={{
                position: "absolute", left: 2, top: 0, bottom: 0,
                width: 1, background: "#1a1a1a",
              }} />
            </div>
            <div
              style={{
                width: splitPx, flexShrink: 0,
                overflowY: "auto", padding: "10px 12px",
                background: "#0a0a0a", minWidth: MIN_SIDE,
              }}
            >
              {sidebar}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
