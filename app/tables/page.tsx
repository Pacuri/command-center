"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";
import TableBrowser from "@/components/TableBrowser";
import BrainBrowser from "@/components/brain/BrainBrowser";

export default function TablesPage() {
  const [view, setView] = useState<"brain" | "list">("brain");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 32px 0", flexShrink: 0 }}>
          <div style={{ color: "#555", marginBottom: 6, fontSize: "14px" }}>
            <span style={{ color: "#4ade80" }}>nikola</span>
            <span style={{ color: "#333" }}>@cc</span>{" "}
            <span>~/tables</span>
          </div>
          <div
            style={{
              marginBottom: 16,
              color: "#555",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>database browser · all schemas</span>
            <div style={{ display: "flex", gap: 2 }}>
              <button
                onClick={() => setView("brain")}
                style={{
                  padding: "3px 10px",
                  fontSize: 11,
                  fontFamily: "inherit",
                  border: "1px solid #1a1a1a",
                  borderRadius: "3px 0 0 3px",
                  background: view === "brain" ? "#151515" : "transparent",
                  color: view === "brain" ? "#4ade80" : "#444",
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
              >
                brain
              </button>
              <button
                onClick={() => setView("list")}
                style={{
                  padding: "3px 10px",
                  fontSize: 11,
                  fontFamily: "inherit",
                  border: "1px solid #1a1a1a",
                  borderRadius: "0 3px 3px 0",
                  background: view === "list" ? "#151515" : "transparent",
                  color: view === "list" ? "#4ade80" : "#444",
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
              >
                list
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: view === "list" ? "auto" : "hidden" }}>
          {view === "brain" ? (
            <BrainBrowser />
          ) : (
            <div style={{ padding: "0 32px 64px", maxWidth: 1100 }}>
              <TableBrowser />
            </div>
          )}
        </div>
      </div>

      <StatusBar counts={{ openTasks: 0, todayEvents: 0, activeProjects: 0, unreadInbox: 0 }} />
    </div>
  );
}
