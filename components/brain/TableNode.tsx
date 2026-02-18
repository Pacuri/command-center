"use client";

import { useState } from "react";

interface TableNodeProps {
  icon: string;
  label: string;
  rowCount: number;
  onClick: (e: React.MouseEvent) => void;
}

export default function TableNode({ icon, label, rowCount, onClick }: TableNodeProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
        cursor: "pointer",
        transition: "transform 0.2s",
        userSelect: "none",
        textAlign: "center",
        padding: "4px 0",
        transform: hover ? "scale(1.06)" : "scale(1)",
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          border: hover ? "1.5px solid #60a5fa" : "1.5px solid #1a1a2a",
          background: "#0d0d0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          transition: "all 0.25s",
          margin: "0 auto 4px",
          boxShadow: hover ? "0 0 10px rgba(96, 165, 250, 0.2)" : "none",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 9,
          color: hover ? "#aaa" : "#444",
          transition: "color 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 8, color: "#2a2a2a" }}>{rowCount}</div>
    </div>
  );
}
