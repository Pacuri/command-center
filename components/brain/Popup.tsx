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
}

interface PopupProps {
  popup: PopupState;
  onClose: (id: string) => void;
  onBringToFront: (id: string) => void;
  onDragMove: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
}

export default function Popup({ popup, onClose, onBringToFront, onDragMove, children }: PopupProps) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

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

  const minW = popup.isFinder ? 380 : 320;
  const maxW = popup.isFinder ? 520 : 480;
  const maxH = popup.isFinder ? 480 : 400;

  return (
    <div
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
        minWidth: minW,
        maxWidth: maxW,
        minHeight: 200,
        maxHeight: maxH,
        animation: "popup-in 0.15s ease-out",
      }}
      onMouseDown={() => onBringToFront(popup.id)}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "#111",
          borderBottom: "1px solid #1a1a1a",
          cursor: "move",
          flexShrink: 0,
        }}
        onMouseDown={startDrag}
      >
        <div
          style={{
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
          <span style={{ fontSize: 14 }}>{popup.titleIcon}</span>
          {popup.title}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(popup.id);
          }}
          style={{
            fontSize: 11,
            color: "#444",
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: 3,
            border: "none",
            background: "none",
            fontFamily: "inherit",
            transition: "all 0.1s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.background = "#1a1a1a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#444";
            e.currentTarget.style.background = "none";
          }}
        >
          ✕
        </button>
      </div>

      {/* Breadcrumb */}
      {popup.breadcrumbs.length > 0 && (
        <div
          style={{
            padding: "6px 14px",
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

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 10px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
