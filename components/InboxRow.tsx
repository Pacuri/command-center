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
        gap: 10,
        padding: "7px 0",
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
          fontSize: "11px",
          fontWeight: 600,
          padding: "1px 5px",
          borderRadius: 2,
          lineHeight: "20px",
          flexShrink: 0,
          background: isAgent ? "#1f1530" : "#1a1a1a",
          color: isAgent ? "#8b5cf6" : "#555",
        }}
      >
        {isAgent ? "AGT" : "SYS"}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#c8c8c8", fontSize: "14px" }}>{item.title}</div>
        {item.description && (
          <div style={{ color: "#555", fontSize: "13px", marginTop: 1 }}>
            {item.description}
          </div>
        )}
      </div>
      <span style={{ color: "#333", fontSize: "12px", flexShrink: 0 }}>
        {timeAgo(item.createdAt)}
      </span>
    </div>
  );
}
