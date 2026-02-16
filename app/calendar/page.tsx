import { getEventsForMonth } from "@/lib/queries";
import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";
import Calendar from "@/components/Calendar";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const now = new Date();
  const events = await getEventsForMonth(now.getFullYear(), now.getMonth() + 1);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "20px 28px 60px", maxWidth: 920 }}>
        <div style={{ color: "#555", marginBottom: 4, fontSize: "12px" }}>
          <span style={{ color: "#4ade80" }}>nikola</span>
          <span style={{ color: "#333" }}>@cc</span> ~/calendar
        </div>

        <div
          style={{
            color: "#333",
            fontSize: "10px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            padding: "4px 0 8px",
            borderBottom: "1px solid #1a1a1a",
            marginBottom: 8,
            marginTop: 16,
          }}
        >
          ── {now.toLocaleString("en", { month: "long" }).toLowerCase()}{" "}
          {now.getFullYear()} ──
        </div>

        <div style={{ maxWidth: 400 }}>
          <Calendar events={events} />
        </div>

        {/* All events list */}
        <div
          style={{
            color: "#333",
            fontSize: "10px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            padding: "4px 0 8px",
            borderBottom: "1px solid #1a1a1a",
            marginBottom: 2,
            marginTop: 24,
          }}
        >
          ── all events ──
        </div>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              display: "flex",
              gap: 8,
              padding: "5px 0",
              fontSize: "12px",
              borderBottom: "1px solid #111",
            }}
          >
            <span style={{ width: 70, color: "#333", flexShrink: 0 }}>
              {event.eventDate}
            </span>
            <span style={{ width: 40, color: "#555", flexShrink: 0 }}>
              {event.eventTime || ""}
            </span>
            <span style={{ color: "#c8c8c8", flex: 1 }}>{event.title}</span>
            <span
              style={{
                fontSize: "10px",
                color: event.type === "deadline" ? "#ef4444" : "#555",
              }}
            >
              {event.type}
            </span>
          </div>
        ))}
        {events.length === 0 && (
          <div style={{ color: "#333", padding: "8px 0", fontSize: "11px" }}>
            no events this month
          </div>
        )}
      </main>
      <StatusBar />
    </div>
  );
}
