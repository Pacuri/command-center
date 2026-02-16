"use client";

interface InboxItem {
  id: number;
  title: string;
  description?: string | null;
  source: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return diffDays === 1 ? "yesterday" : `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "now";
}

export default function InboxRow({
  item,
  onMarkRead,
}: {
  item: InboxItem;
  onMarkRead?: (id: number) => void;
}) {
  const isAgent = item.source === "agent";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "5px 0",
        borderBottom: "1px solid #111",
        cursor: "pointer",
        opacity: item.read ? 0.5 : 1,
      }}
      onClick={() => onMarkRead?.(item.id)}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#151515")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          padding: "0 4px",
          borderRadius: 2,
          lineHeight: "18px",
          flexShrink: 0,
          background: isAgent ? "#1f1530" : "#1a1a1a",
          color: isAgent ? "#8b5cf6" : "#555",
        }}
      >
        {isAgent ? "AGT" : "SYS"}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#c8c8c8", fontSize: "12px" }}>{item.title}</div>
        {item.description && (
          <div style={{ color: "#555", fontSize: "11px" }}>
            {item.description}
          </div>
        )}
      </div>
      <span style={{ color: "#333", fontSize: "10px", flexShrink: 0 }}>
        {timeAgo(item.createdAt)}
      </span>
    </div>
  );
}
