"use client";

interface SidebarPreviewProps {
  row: Record<string, unknown> | null;
  tableName?: string;
}

export default function SidebarPreview({ row, tableName }: SidebarPreviewProps) {
  if (!row) {
    return (
      <div style={{ color: "#333", fontSize: 11, padding: "8px 0" }}>
        select an item to preview
      </div>
    );
  }

  // Get primary name
  const name = String(
    row.title || row.name || row.key || row.task || row.stance || row.what || row.id || "—"
  );

  // Get preview fields (skip id and primary name key)
  const nameKey = row.title
    ? "title"
    : row.name
    ? "name"
    : row.key
    ? "key"
    : row.task
    ? "task"
    : "__none__";

  const fields = Object.entries(row).filter(
    ([k]) => k !== "id" && k !== nameKey
  );

  return (
    <div style={{ fontSize: 11 }}>
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: "#4ade80", fontSize: 10, letterSpacing: "0.5px", marginBottom: 2 }}>
          {tableName || "record"}
        </div>
        <div
          style={{
            color: "#ccc",
            fontSize: 12,
            wordBreak: "break-word",
            lineHeight: 1.4,
          }}
        >
          {name.length > 80 ? name.slice(0, 80) + "…" : name}
        </div>
      </div>

      {/* Fields */}
      {fields.slice(0, 8).map(([key, value]) => {
        const isNull = value === null || value === undefined;
        const display = isNull ? "null" : String(value);
        const truncated = display.length > 120 ? display.slice(0, 120) + "…" : display;
        return (
          <div key={key} style={{ marginBottom: 8 }}>
            <div style={{ color: "#555", fontSize: 9, letterSpacing: "0.3px" }}>{key}</div>
            <div
              style={{
                color: isNull ? "#333" : "#777",
                fontSize: 11,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.4,
                fontStyle: isNull ? "italic" : "normal",
              }}
            >
              {truncated}
            </div>
          </div>
        );
      })}
      {fields.length > 8 && (
        <div style={{ color: "#333", fontSize: 10 }}>+{fields.length - 8} more fields</div>
      )}
    </div>
  );
}
