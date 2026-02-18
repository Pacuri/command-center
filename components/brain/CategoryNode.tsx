"use client";

import { useState } from "react";

interface CategoryNodeProps {
  icon: string;
  label: string;
  tableCount: number;
  style: React.CSSProperties;
  onClick: (e: React.MouseEvent) => void;
}

export default function CategoryNode({ icon, label, tableCount, style, onClick }: CategoryNodeProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        cursor: "pointer",
        transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        userSelect: "none",
        textAlign: "center",
        transform: hover ? "scale(1.1)" : "scale(1)",
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          border: hover ? "1.5px solid #4ade80" : "1.5px solid #1a2a1a",
          background: "#0d0d0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          transition: "all 0.25s",
          margin: "0 auto 6px",
          boxShadow: hover ? "0 0 16px rgba(74, 222, 128, 0.25)" : "none",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 11,
          color: hover ? "#ccc" : "#4ade80",
          transition: "color 0.15s",
          whiteSpace: "nowrap",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 9, color: "#333", marginTop: 1 }}>
        {tableCount} table{tableCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
