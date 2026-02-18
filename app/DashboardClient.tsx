"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
  agentActive?: boolean;
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
    <div style={{ minHeight: "100vh" }}>
      {/* Content area */}
      <div
        style={{
          padding: "24px 32px 64px",
          overflowY: "auto",
        }}
      >
        {/* Prompt + Date + Focus — full width above tasks row */}
        <div style={{ maxWidth: 960 }}>
          <div style={{ color: "#555", marginBottom: 6, fontSize: "14px" }}>
            <span style={{ color: "#4ade80" }}>nikola</span>
            <span style={{ color: "#333" }}>@cc</span>{" "}
            <span>~/overview</span>
          </div>
          <div style={{ marginBottom: 16, color: "#555", fontSize: "13px" }}>
            {dateStr} · {data.counts.dueToday} due today ·{" "}
            {data.counts.todayEvents} meeting
            {data.counts.todayEvents !== 1 ? "s" : ""} ·{" "}
            {data.counts.unreadInbox} inbox
          </div>
          {data.focus && <FocusStrip content={data.focus.content} />}
        </div>

        {/* Tasks + Calendar row — calendar aligns with tasks top */}
        <div style={{ display: "flex", gap: 32, marginBottom: 28 }}>
          {/* Tasks */}
          <section style={{ maxWidth: 960, flex: 1, minWidth: 0 }}>
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

          {/* Calendar — aligned with tasks top */}
          <aside style={{ width: 198, flexShrink: 0, alignSelf: "flex-start" }}>
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

            {/* Avatar — links to brain browser */}
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
              {data.agentActive && (
                <style>{`
                  @keyframes avatar-pulse {
                    0%, 100% { box-shadow: 0 0 8px 2px rgba(74, 222, 128, 0.3); }
                    50% { box-shadow: 0 0 20px 6px rgba(74, 222, 128, 0.6); }
                  }
                `}</style>
              )}
              <Link href="/tables" title="Brain Browser" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    width: 158,
                    height: 158,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: data.agentActive ? "2px solid #4ade80" : "2px solid #1a1a1a",
                    animation: data.agentActive ? "avatar-pulse 2s ease-in-out infinite" : "none",
                    transition: "border-color 0.3s ease, transform 0.15s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://sacwbhhusphqzsaoyhit.supabase.co/storage/v1/object/public/identity/avatar.png"
                    alt="avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </Link>
            </div>
          </aside>
        </div>

        {/* Projects + Inbox row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 960 }}>
          <section>
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
              <div style={{ color: "#333", padding: "10px 0", fontSize: "13px" }}>
                no active projects
              </div>
            )}
          </section>

          <section>
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
      </div>

      <StatusBar counts={data.counts} />
    </div>
  );
}
