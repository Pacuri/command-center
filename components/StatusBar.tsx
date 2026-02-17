"use client";

import { useEffect, useState } from "react";

interface StatusBarProps {
  counts?: {
    openTasks: number;
    todayEvents: number;
    activeProjects: number;
    unreadInbox: number;
  };
}

export default function StatusBar({ counts }: StatusBarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 52,
        right: 0,
        height: 28,
        background: "#0f0f0f",
        borderTop: "1px solid #1a1a1a",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        fontSize: 12,
        color: "#333",
        gap: 18,
        fontFamily: "'JetBrains Mono', monospace",
        zIndex: 50,
      }}
    >
      <span style={{ color: "#4ade80" }}>● connected</span>
      <span style={{ color: "#1a1a1a" }}>│</span>
      {counts && (
        <>
          <span>
            tasks:{counts.openTasks} events:{counts.todayEvents} projects:
            {counts.activeProjects}
          </span>
          <span style={{ color: "#1a1a1a" }}>│</span>
          {counts.unreadInbox > 0 && (
            <>
              <span style={{ color: "#eab308" }}>
                {counts.unreadInbox} unread
              </span>
              <span style={{ color: "#1a1a1a" }}>│</span>
            </>
          )}
        </>
      )}
      <span style={{ marginLeft: "auto" }}>
        {time} · CC v0.1.0
      </span>
    </div>
  );
}
