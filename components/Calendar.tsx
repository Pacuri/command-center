"use client";

interface Event {
  id: number;
  title: string;
  description?: string | null;
  eventDate: string;
  eventTime?: string | null;
  durationMin?: number | null;
  type: string;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  return `${hour}:${m}`;
}

export default function Calendar({ events }: { events: Event[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const today = now.getDate();
  const todayStr = now.toISOString().split("T")[0];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevDays = getDaysInMonth(prevYear, prevMonth);

  const eventDates = new Set(events.map((e) => e.eventDate));

  const todayEvents = events
    .filter((e) => e.eventDate === todayStr)
    .sort((a, b) => (a.eventTime || "").localeCompare(b.eventTime || ""));

  const days: Array<{ day: number; current: boolean; date: string }> = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ day: d, current: false, date: dateStr });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ day: d, current: true, date: dateStr });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, current: false, date: dateStr });
    }
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: 4,
        }}
      >
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <span
            key={d}
            style={{
              textAlign: "center",
              fontSize: "15px",
              color: "#555",
              padding: "4px 0",
              letterSpacing: "0.5px",
            }}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 3,
        }}
      >
        {days.map((d, i) => {
          const isToday = d.current && d.day === today;
          const hasEvent = eventDates.has(d.date);

          return (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: "9px 0",
                fontSize: "16px",
                color: !d.current
                  ? "#1a1a1a"
                  : isToday
                    ? "#0a0a0a"
                    : "#555",
                background: isToday
                  ? "#4ade80"
                  : d.current && hasEvent
                    ? "rgba(74, 222, 128, 0.06)"
                    : "transparent",
                fontWeight: isToday ? 700 : 400,
                borderRadius: 3,
                cursor: "pointer",
                position: "relative",
              }}
            >
              {d.day}
              {hasEvent && !isToday && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 2,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#ef4444",
                  }}
                />
              )}
              {hasEvent && isToday && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 2,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#0a0a0a",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Today's schedule */}
      {todayEvents.length > 0 && (
        <div
          style={{
            marginTop: 15,
            paddingTop: 12,
            borderTop: "1px solid #1a1a1a",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              color: "#555",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            today
          </div>
          {todayEvents.map((event) => (
            <div
              key={event.id}
              style={{
                display: "flex",
                gap: 12,
                padding: "5px 0",
                fontSize: "16px",
              }}
            >
              <span
                style={{
                  width: 55,
                  textAlign: "right",
                  color: "#555",
                  flexShrink: 0,
                }}
              >
                {formatTime(event.eventTime)}
              </span>
              <div
                style={{
                  width: 4,
                  flexShrink: 0,
                  borderRadius: 1,
                  alignSelf: "stretch",
                  background:
                    event.type === "deadline"
                      ? "#ef4444"
                      : event.type === "milestone"
                        ? "#eab308"
                        : "#8b5cf6",
                }}
              />
              <span
                style={{
                  color:
                    event.type === "deadline" ? "#ef4444" : "#c8c8c8",
                }}
              >
                {event.title}
              </span>
              {event.durationMin && (
                <span style={{ color: "#555" }}>
                  · {event.durationMin}m
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
