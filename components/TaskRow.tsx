"use client";

interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  dueDate?: string | null;
  category?: string | null;
  createdBy: string;
}

const PRIORITY_CONFIG: Record<
  string,
  {
    color: string;
    dimColor: string;
    bgColor: string;
    statusIcon: string;
    fontSize: string;
    fontWeight: number;
    padding: string;
    showDesc: boolean;
  }
> = {
  urgent: {
    color: "#ef4444",
    dimColor: "#884444",
    bgColor: "#3a1a1a",
    statusIcon: "●",
    fontSize: "13px",
    fontWeight: 600,
    padding: "8px 4px",
    showDesc: true,
  },
  high: {
    color: "#eab308",
    dimColor: "#887744",
    bgColor: "#2a2510",
    statusIcon: "◐",
    fontSize: "12.5px",
    fontWeight: 500,
    padding: "6px 4px",
    showDesc: true,
  },
  normal: {
    color: "#c8c8c8",
    dimColor: "#555",
    bgColor: "#1a2030",
    statusIcon: "○",
    fontSize: "12px",
    fontWeight: 400,
    padding: "4px 4px",
    showDesc: false,
  },
  low: {
    color: "#555",
    dimColor: "#333",
    bgColor: "transparent",
    statusIcon: "○",
    fontSize: "11px",
    fontWeight: 400,
    padding: "2px 4px",
    showDesc: false,
  },
};

function formatDue(date: string | null | undefined): string {
  if (!date) return "---";
  const today = new Date().toISOString().split("T")[0];
  if (date === today) return "TODAY";
  const d = new Date(date);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[d.getUTCDay()].toUpperCase();
}

export default function TaskRow({
  task,
  index,
  onComplete,
}: {
  task: Task;
  index: number;
  onComplete?: (id: number) => void;
}) {
  const config = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.normal;
  const today = new Date().toISOString().split("T")[0];
  const isToday = task.dueDate === today;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: config.padding,
        borderBottom: "1px solid #111",
        cursor: "pointer",
        borderRadius: 2,
        transition: "background 0.06s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "#151515")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      <span
        style={{
          width: 20,
          textAlign: "right",
          color: task.priority === "urgent" ? "#ef4444" : "#333",
          flexShrink: 0,
          fontSize: task.priority === "low" ? "10px" : "12px",
        }}
      >
        {index}
      </span>

      <span
        style={{
          width: 12,
          flexShrink: 0,
          color: config.color,
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onComplete?.(task.id);
        }}
      >
        {config.statusIcon}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: config.color,
            fontWeight: config.fontWeight,
            fontSize: config.fontSize,
          }}
        >
          {task.title}
        </div>
        {config.showDesc && task.description && (
          <div
            style={{
              color: config.dimColor,
              fontSize: "11px",
              marginTop: 1,
            }}
          >
            {task.description}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {task.category && (
          <span
            style={{
              fontSize: "10px",
              padding: "0 5px",
              borderRadius: 2,
              lineHeight: "18px",
              fontWeight: 500,
              background: config.bgColor,
              color: config.color,
            }}
          >
            {task.category.toUpperCase()}
          </span>
        )}
        <span
          style={{
            color: isToday && task.priority === "urgent" ? "#ef4444" : "#333",
            fontSize: "12px",
          }}
        >
          {formatDue(task.dueDate)}
        </span>
      </div>
    </div>
  );
}
