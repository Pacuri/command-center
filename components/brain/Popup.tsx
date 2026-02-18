"use client";

import { useRef, useEffect, useCallback } from "react";

export interface PopupState {
  id: string;
  x: number;
  y: number;
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
  onDragMove: (id: string, x: number, y: number) => void;
  onBack: (id: string) => void;
  onForward: (id: string) => void;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export default function Popup({
  popup,
  onClose,
  onBringToFront,
  onDragMove,
  onBack,
  onForward,
  sidebar,
  children,
}: PopupProps) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      onDragMove(popup.id, dragRef.current.origX + dx, dragRef.current.origY + dy);
    },
    [popup.id, onDragMove]
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Mouse back/forward buttons (button 3 = back, button 4 = forward)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      if (e.button === 3) {
        e.preventDefault();
        e.stopPropagation();
        if (popup.canGoBack) onBack(popup.id);
      } else if (e.button === 4) {
        e.preventDefault();
        e.stopPropagation();
        if (popup.canGoForward) onForward(popup.id);
      }
    };
    el.addEventListener("mousedown", handler);
    return () => el.removeEventListener("mousedown", handler);
  }, [popup.id, popup.canGoBack, popup.canGoForward, onBack, onForward]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    onBringToFront(popup.id);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: popup.x,
      origY: popup.y,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: popup.x,
        top: popup.y,
        background: "#0d0d0d",
        border: "1px solid #1a1a1a",
        borderRadius: 6,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(74,222,128,0.1)",
        zIndex: popup.zIndex,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        resize: "both",
        minWidth: sidebar ? 520 : 340,
        maxWidth: sidebar ? 720 : 520,
        minHeight: 240,
        maxHeight: 520,
        animation: "popup-in 0.15s ease-out",
      }}
      onMouseDown={() => onBringToFront(popup.id)}
    >
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
        }}
        onMouseDown={startDrag}
      >
        {/* Traffic lights area: close + nav buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(popup.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "none",
              background: "#333",
              cursor: "pointer",
              padding: 0,
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#333")}
          />

          {/* Separator */}
          <div style={{ width: 1, height: 14, background: "#1a1a1a", margin: "0 2px" }} />

          {/* Back */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (popup.canGoBack) onBack(popup.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              fontSize: 13,
              color: popup.canGoBack ? "#666" : "#222",
              cursor: popup.canGoBack ? "pointer" : "default",
              padding: "0 4px",
              border: "none",
              background: "none",
              fontFamily: "inherit",
              transition: "color 0.1s",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              if (popup.canGoBack) e.currentTarget.style.color = "#4ade80";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = popup.canGoBack ? "#666" : "#222";
            }}
          >
            ‹
          </button>

          {/* Forward */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (popup.canGoForward) onForward(popup.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              fontSize: 13,
              color: popup.canGoForward ? "#666" : "#222",
              cursor: popup.canGoForward ? "pointer" : "default",
              padding: "0 4px",
              border: "none",
              background: "none",
              fontFamily: "inherit",
              transition: "color 0.1s",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              if (popup.canGoForward) e.currentTarget.style.color = "#4ade80";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = popup.canGoForward ? "#666" : "#222";
            }}
          >
            ›
          </button>
        </div>

        {/* Title */}
        <div
          style={{
            flex: 1,
            fontSize: 12,
            color: "#888",
            display: "flex",
            alignItems: "center",
            gap: 6,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
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
            padding: "5px 14px",
            fontSize: 10,
            color: "#444",
            borderBottom: "1px solid #111",
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
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
                  onMouseEnter={(e) => {
                    if (!isLast) e.currentTarget.style.color = "#4ade80";
                  }}
                  onMouseLeave={(e) => {
                    if (!isLast) e.currentTarget.style.color = "#555";
                  }}
                >
                  {crumb.label}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* Body: content + optional sidebar */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Main content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 10px",
            minWidth: 0,
          }}
        >
          {children}
        </div>

        {/* Sidebar / preview panel */}
        {sidebar && (
          <>
            <div style={{ width: 1, background: "#1a1a1a", flexShrink: 0 }} />
            <div
              style={{
                width: 220,
                flexShrink: 0,
                overflowY: "auto",
                padding: "10px 12px",
                background: "#0a0a0a",
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
