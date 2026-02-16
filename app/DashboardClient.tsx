"use client";

import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";
import FocusStrip from "@/components/FocusStrip";
import TaskRow from "@/components/TaskRow";
import Calendar from "@/components/Calendar";
import ProjectRow from "@/components/ProjectRow";
import InboxRow from "@/components/InboxRow";
import { useRouter } from "next/navigation";

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

export default function DashboardClient({ data }: { data: DashboardData }) {
  const router = useRouter();

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
    router.refresh();
  };

  const handleMarkRead = async (id: number) => {
    await fetch(`/api/inbox/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    router.refresh();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar inboxCount={data.counts.unreadInbox} />

      <main
        style={{
          flex: 1,
          padding: "20px 28px 60px",
          overflowY: "auto",
          maxWidth: 920,
        }}
      >
        {/* Prompt */}
        <div style={{ color: "#555", marginBottom: 4, fontSize: "12px" }}>
          <span style={{ color: "#4ade80" }}>nikola</span>
          <span style={{ color: "#333" }}>@cc</span>{" "}
          <span>~/overview</span>
        </div>
        <div
          style={{ marginBottom: 12, color: "#333", fontSize: "12px" }}
        >
          {dateStr} · {data.counts.dueToday} due today ·{" "}
          {data.counts.todayEvents} meeting
          {data.counts.todayEvents !== 1 ? "s" : ""} ·{" "}
          {data.counts.unreadInbox} inbox
        </div>

        {/* Focus */}
        {data.focus && <FocusStrip content={data.focus.content} />}

        {/* Tasks */}
        <section style={{ marginBottom: 24 }}>
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
            <div style={{ color: "#333", padding: "8px 0", fontSize: "11px" }}>
              no open tasks
            </div>
          )}
        </section>

        {/* Two-column: Calendar + Projects */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 28,
          }}
        >
          {/* Calendar */}
          <section style={{ marginBottom: 24 }}>
            <div
              style={{
                color: "#333",
                fontSize: "10px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                padding: "4px 0 8px",
                borderBottom: "1px solid #1a1a1a",
                marginBottom: 8,
              }}
            >
              ── {months[now.getMonth()].toLowerCase()} {now.getFullYear()} ──
            </div>
            <Calendar events={data.upcomingEvents} />
          </section>

          {/* Projects */}
          <section style={{ marginBottom: 24 }}>
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
              <span>── projects ──</span>
              <span>{data.counts.activeProjects}</span>
            </div>
            {data.projects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
            {data.projects.length === 0 && (
              <div
                style={{ color: "#333", padding: "8px 0", fontSize: "11px" }}
              >
                no active projects
              </div>
            )}
          </section>
        </div>

        {/* Inbox */}
        <section style={{ marginBottom: 24 }}>
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
            <div style={{ color: "#333", padding: "8px 0", fontSize: "11px" }}>
              inbox clear
            </div>
          )}
        </section>
      </main>

      <StatusBar counts={data.counts} />
    </div>
  );
}
