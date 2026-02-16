"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";
import TaskRow from "@/components/TaskRow";

export default function TasksClient({ tasks }: { tasks: any[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");

  const filtered = tasks.filter((t) => {
    if (filter === "open") return t.status === "open";
    if (filter === "done") return t.status === "done";
    return true;
  });

  const handleComplete = async (id: number) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    router.refresh();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "20px 28px 60px", maxWidth: 920 }}>
        <div style={{ color: "#555", marginBottom: 4, fontSize: "12px" }}>
          <span style={{ color: "#4ade80" }}>nikola</span>
          <span style={{ color: "#333" }}>@cc</span> ~/tasks
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, fontSize: "11px" }}>
          {(["all", "open", "done"] as const).map((f) => (
            <span
              key={f}
              onClick={() => setFilter(f)}
              style={{
                color: filter === f ? "#4ade80" : "#555",
                cursor: "pointer",
                borderBottom: filter === f ? "1px solid #4ade80" : "none",
                paddingBottom: 2,
              }}
            >
              {f} ({tasks.filter((t) => f === "all" ? true : t.status === f).length})
            </span>
          ))}
        </div>

        <div
          style={{
            color: "#333",
            fontSize: "10px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            padding: "4px 0 8px",
            borderBottom: "1px solid #1a1a1a",
            marginBottom: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>── tasks ──</span>
          <span>{filtered.length}</span>
        </div>

        {filtered.map((task, i) => (
          <TaskRow
            key={task.id}
            task={task}
            index={i + 1}
            onComplete={task.status === "open" ? handleComplete : undefined}
          />
        ))}
      </main>
      <StatusBar />
    </div>
  );
}
