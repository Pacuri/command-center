"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";
import FocusStrip from "@/components/FocusStrip";
import TaskRow from "@/components/TaskRow";
import Calendar from "@/components/Calendar";
import ProjectRow from "@/components/ProjectRow";
import InboxRow from "@/components/InboxRow";

interface DashboardData {
  tasks: any[];
  todayEvents: any[];
  upcomingEvents: any[];
  projects: any[];
  inbox: any[];
  focus: { content: string } | null;
  counts: {
    openTasks: number;
    dueToday: number;
    todayEvents: number;
    activeProjects: number;
    unreadInbox: number;
  };
}

export default function DashboardClient({ data: initialData }: { data: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initialData);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (res.ok) {
        const fresh = await res.json();
        setData(fresh);
      }
    } catch {
      // silent fail, keep showing last data
    }
  }, []);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const now = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const dateStr = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;

  const handleComplete = async (id: number) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    fetchData();
  };

  const handleMarkRead = async (id: number) => {
    await fetch(`/api/inbox/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    fetchData();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar inboxCount={data.counts.unreadInbox} />

      <main
        style={{
          flex: 1,
          padding: "24px 32px 64px",
          overflowY: "auto",
        }}
      >
        {/* Prompt */}
        <div style={{ color: "#555", marginBottom: 6, fontSize: "14px" }}>
          <span style={{ color: "#4ade80" }}>nikola</span>
          <span style={{ color: "#333" }}>@cc</span>{" "}
          <span>~/overview</span>
        </div>
        <div
          style={{ marginBottom: 16, color: "#555", fontSize: "13px" }}
        >
          {dateStr} · {data.counts.dueToday} due today ·{" "}
          {data.counts.todayEvents} meeting
          {data.counts.todayEvents !== 1 ? "s" : ""} ·{" "}
          {data.counts.unreadInbox} inbox
        </div>

        {/* Focus */}
        {data.focus && <FocusStrip content={data.focus.content} />}

        {/* Main grid: tasks + calendar top, projects + inbox bottom */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1.5fr",
            gridTemplateRows: "auto auto",
            gap: "28px 32px",
          }}
        >
          {/* Tasks — top left, spans 2 cols */}
          <section style={{ gridColumn: "1 / 3", gridRow: "1" }}>
            <div
              style={{
                color: "#555",
                fontSize: "12px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                padding: "6px 0 10px",
                borderBottom: "1px solid #1a1a1a",
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>── tasks ──</span>
              <span>{data.counts.openTasks} open</span>
            </div>
            {data.tasks.map((task, i) => (
              <TaskRow
                key={task.id}
                task={task}
                index={i + 1}
                onComplete={handleComplete}
              />
            ))}
            {data.tasks.length === 0 && (
              <div style={{ color: "#333", padding: "10px 0", fontSize: "13px" }}>
                no open tasks
              </div>
            )}
          </section>

          {/* Calendar — top right, spans both rows */}
          <section style={{ gridColumn: "3", gridRow: "1 / 3" }}>
            <div
              style={{
                color: "#555",
                fontSize: "12px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                padding: "6px 0 10px",
                borderBottom: "1px solid #1a1a1a",
                marginBottom: 10,
              }}
            >
              ── {months[now.getMonth()].toLowerCase()} {now.getFullYear()} ──
            </div>
            <Calendar events={data.upcomingEvents} />
          </section>

          {/* Projects — bottom left */}
          <section style={{ gridColumn: "1", gridRow: "2" }}>
            <div
              style={{
                color: "#555",
                fontSize: "12px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                padding: "6px 0 10px",
                borderBottom: "1px solid #1a1a1a",
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>── projects ──</span>
              <span>{data.counts.activeProjects}</span>
            </div>
            {data.projects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
            {data.projects.length === 0 && (
              <div
                style={{ color: "#333", padding: "10px 0", fontSize: "13px" }}
              >
                no active projects
              </div>
            )}
          </section>

          {/* Inbox — bottom right (next to projects) */}
          <section style={{ gridColumn: "2", gridRow: "2" }}>
            <div
              style={{
                color: "#555",
                fontSize: "12px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                padding: "6px 0 10px",
                borderBottom: "1px solid #1a1a1a",
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>── inbox ──</span>
              <span>{data.counts.unreadInbox} new</span>
            </div>
            {data.inbox.map((item) => (
              <InboxRow
                key={item.id}
                item={item}
                onMarkRead={handleMarkRead}
              />
            ))}
            {data.inbox.length === 0 && (
              <div style={{ color: "#333", padding: "10px 0", fontSize: "13px" }}>
                inbox clear
              </div>
            )}
          </section>
        </div>
      </main>

      <StatusBar counts={data.counts} />
    </div>
  );
}
