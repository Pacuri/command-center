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
    fontSize: "16px",
    fontWeight: 600,
    padding: "10px 6px",
    showDesc: true,
  },
  high: {
    color: "#eab308",
    dimColor: "#887744",
    bgColor: "#2a2510",
    statusIcon: "◐",
    fontSize: "15px",
    fontWeight: 500,
    padding: "8px 6px",
    showDesc: true,
  },
  normal: {
    color: "#c8c8c8",
    dimColor: "#555",
    bgColor: "#1a2030",
    statusIcon: "○",
    fontSize: "14px",
    fontWeight: 400,
    padding: "6px 6px",
    showDesc: false,
  },
  low: {
    color: "#555",
    dimColor: "#333",
    bgColor: "transparent",
    statusIcon: "○",
    fontSize: "13px",
    fontWeight: 400,
    padding: "4px 6px",
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
        gap: 10,
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
          width: 24,
          textAlign: "right",
          color: task.priority === "urgent" ? "#ef4444" : "#333",
          flexShrink: 0,
          fontSize: task.priority === "low" ? "12px" : "14px",
        }}
      >
        {index}
      </span>

      <span
        style={{
          width: 16,
          flexShrink: 0,
          color: config.color,
          cursor: "pointer",
          fontSize: "14px",
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
              fontSize: "13px",
              marginTop: 2,
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
          gap: 10,
          flexShrink: 0,
        }}
      >
        {task.category && (
          <span
            style={{
              fontSize: "11px",
              padding: "1px 6px",
              borderRadius: 2,
              lineHeight: "20px",
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
            fontSize: "13px",
          }}
        >
          {formatDue(task.dueDate)}
        </span>
      </div>
    </div>
  );
}
