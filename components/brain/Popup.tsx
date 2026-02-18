"use client";

import { useRef, useEffect, useState } from "react";

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

type DragMode = "move" | "resize-e" | "resize-s" | "resize-se" | "resize-w" | "resize-sw";

const MIN_W = 320;
const MIN_H = 200;
const MIN_MAIN = 140;
const MIN_SIDE = 100;
const EDGE = 6;

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
  const [splitPx, setSplitPx] = useState(220);

  // ── Refs to keep latest props accessible from stable listeners ──
  const propsRef = useRef({ id: popup.id, x: popup.x, y: popup.y, w: popup.w, h: popup.h, onMove, onResize });
  propsRef.current = { id: popup.id, x: popup.x, y: popup.y, w: popup.w, h: popup.h, onMove, onResize };

  const navRef = useRef({ canGoBack: popup.canGoBack, canGoForward: popup.canGoForward, onBack, onForward, id: popup.id });
  navRef.current = { canGoBack: popup.canGoBack, canGoForward: popup.canGoForward, onBack, onForward, id: popup.id };

  // ── Drag / Resize ──
  const dragState = useRef<{ mode: DragMode; startMX: number; startMY: number; startX: number; startY: number; startW: number; startH: number } | null>(null);
  // Stable handler refs (created once, never change)
  const handlersRef = useRef<{ move: (e: PointerEvent) => void; up: () => void } | null>(null);

  if (!handlersRef.current) {
    const onPtrMove = (e: PointerEvent) => {
      const ds = dragState.current;
      if (!ds) return;
      const p = propsRef.current;
      const dx = e.clientX - ds.startMX;
      const dy = e.clientY - ds.startMY;
      if (ds.mode === "move") {
        p.onMove(p.id, ds.startX + dx, ds.startY + dy);
      } else if (ds.mode === "resize-e") {
        p.onResize(p.id, Math.max(MIN_W, ds.startW + dx), ds.startH);
      } else if (ds.mode === "resize-s") {
        p.onResize(p.id, ds.startW, Math.max(MIN_H, ds.startH + dy));
      } else if (ds.mode === "resize-se") {
        p.onResize(p.id, Math.max(MIN_W, ds.startW + dx), Math.max(MIN_H, ds.startH + dy));
      } else if (ds.mode === "resize-w") {
        const newW = Math.max(MIN_W, ds.startW - dx);
        p.onMove(p.id, ds.startX + (ds.startW - newW), ds.startY);
        p.onResize(p.id, newW, ds.startH);
      } else if (ds.mode === "resize-sw") {
        const newW = Math.max(MIN_W, ds.startW - dx);
        p.onMove(p.id, ds.startX + (ds.startW - newW), ds.startY);
        p.onResize(p.id, newW, Math.max(MIN_H, ds.startH + dy));
      }
    };
    const onPtrUp = () => {
      dragState.current = null;
      document.removeEventListener("pointermove", onPtrMove);
      document.removeEventListener("pointerup", onPtrUp);
    };
    handlersRef.current = { move: onPtrMove, up: onPtrUp };
  }

  // Cleanup on unmount
  useEffect(() => {
    const h = handlersRef.current!;
    return () => {
      document.removeEventListener("pointermove", h.move);
      document.removeEventListener("pointerup", h.up);
    };
  }, []);

  function beginDrag(e: React.PointerEvent, mode: DragMode) {
    e.preventDefault();
    e.stopPropagation();
    onBringToFront(popup.id);
    dragState.current = {
      mode,
      startMX: e.clientX, startMY: e.clientY,
      startX: popup.x, startY: popup.y,
      startW: popup.w, startH: popup.h,
    };
    const h = handlersRef.current!;
    document.addEventListener("pointermove", h.move);
    document.addEventListener("pointerup", h.up);
  }

  // ── Splitter drag ──
  const splitState = useRef<{ startX: number; startSplit: number } | null>(null);
  const splitRef = useRef(splitPx);
  splitRef.current = splitPx;
  const splitHandlersRef = useRef<{ move: (e: PointerEvent) => void; up: () => void } | null>(null);

  if (!splitHandlersRef.current) {
    const onSplitMove = (e: PointerEvent) => {
      const ss = splitState.current;
      if (!ss) return;
      setSplitPx(Math.max(MIN_SIDE, Math.min(400, ss.startSplit - (e.clientX - ss.startX))));
    };
    const onSplitUp = () => {
      splitState.current = null;
      document.removeEventListener("pointermove", onSplitMove);
      document.removeEventListener("pointerup", onSplitUp);
    };
    splitHandlersRef.current = { move: onSplitMove, up: onSplitUp };
  }

  useEffect(() => {
    const h = splitHandlersRef.current!;
    return () => {
      document.removeEventListener("pointermove", h.move);
      document.removeEventListener("pointerup", h.up);
    };
  }, []);

  function beginSplitterDrag(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    splitState.current = { startX: e.clientX, startSplit: splitRef.current };
    const h = splitHandlersRef.current!;
    document.addEventListener("pointermove", h.move);
    document.addEventListener("pointerup", h.up);
  }

  // ── Mouse back/forward (buttons 3 & 4) ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const n = navRef.current;
      if (e.button === 3) { e.preventDefault(); if (n.canGoBack) n.onBack(n.id); }
      else if (e.button === 4) { e.preventDefault(); if (n.canGoForward) n.onForward(n.id); }
    };
    el.addEventListener("mouseup", handler);
    return () => el.removeEventListener("mouseup", handler);
  }, []);

  const edgeStyle = (pos: React.CSSProperties, cursor: string): React.CSSProperties => ({
    position: "absolute", ...pos, cursor, zIndex: 2,
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: popup.x, top: popup.y,
        width: popup.w, height: popup.h,
        background: "#0d0d0d",
        border: "1px solid #1a1a1a",
        borderRadius: 6,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(74,222,128,0.1)",
        zIndex: popup.zIndex,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        animation: "popup-in 0.15s ease-out",
      }}
      onMouseDown={() => onBringToFront(popup.id)}
    >
      {/* Resize edges */}
      <div style={edgeStyle({ top: 0, right: 0, width: EDGE, height: "100%" }, "ew-resize")} onPointerDown={(e) => beginDrag(e, "resize-e")} />
      <div style={edgeStyle({ bottom: 0, left: EDGE, right: EDGE, height: EDGE }, "ns-resize")} onPointerDown={(e) => beginDrag(e, "resize-s")} />
      <div style={edgeStyle({ bottom: 0, right: 0, width: EDGE * 3, height: EDGE * 3 }, "nwse-resize")} onPointerDown={(e) => beginDrag(e, "resize-se")} />
      <div style={edgeStyle({ top: 0, left: 0, width: EDGE, height: "100%" }, "ew-resize")} onPointerDown={(e) => beginDrag(e, "resize-w")} />
      <div style={edgeStyle({ bottom: 0, left: 0, width: EDGE * 3, height: EDGE * 3 }, "nesw-resize")} onPointerDown={(e) => beginDrag(e, "resize-sw")} />

      {/* Toolbar — drag handle */}
      <div
        style={{
          display: "flex", alignItems: "center",
          padding: "7px 12px",
          background: "#111",
          borderBottom: "1px solid #1a1a1a",
          cursor: "grab", flexShrink: 0, gap: 8,
          position: "relative", zIndex: 3,
          userSelect: "none",
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          beginDrag(e, "move");
        }}
      >
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
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div
          style={{
            flex: 1, overflowY: "auto", padding: "8px 10px",
            minWidth: sidebar ? MIN_MAIN : 0,
          }}
        >
          {children}
        </div>

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
