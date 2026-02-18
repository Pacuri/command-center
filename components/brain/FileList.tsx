"use client";

function truncate(val: unknown, max: number = 60): string {
  if (val === null || val === undefined) return "—";
  const s = String(val);
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function getRowName(row: Record<string, unknown>): string {
  return truncate(
    row.title || row.name || row.key || row.task || row.stance || row.what ||
    (typeof row.content === "string" ? row.content.slice(0, 40) : null) ||
    `row ${row.id ?? "?"}`,
    50
  );
}

function getPreview(row: Record<string, unknown>): string {
  const nameKey = row.title ? "title" : row.name ? "name" : row.key ? "key" : "__none__";
  return Object.entries(row)
    .filter(([k]) => k !== "id" && k !== nameKey)
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${truncate(v, 35)}`)
    .join(" · ");
}

interface FileListProps {
  rows: Record<string, unknown>[];
  loading?: boolean;
  selectedIndex?: number;
  onSelectRow: (index: number) => void;
  onOpenRow: (index: number) => void;
}

export default function FileList({ rows, loading, selectedIndex, onSelectRow, onOpenRow }: FileListProps) {
  if (loading) {
    return (
      <div style={{ color: "#444", fontSize: 12, padding: "8px 0" }}>loading…</div>
    );
  }

  if (rows.length === 0) {
    return (
      <div style={{ color: "#333", fontSize: 11, padding: "12px 4px" }}>
        empty table
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {rows.map((row, i) => {
        const isSelected = i === selectedIndex;
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "26px 1fr",
              gap: 6,
              padding: "6px 6px",
              borderRadius: 3,
              cursor: "pointer",
              transition: "background 0.1s",
              alignItems: "start",
              background: isSelected ? "#151515" : "transparent",
            }}
            onClick={() => onSelectRow(i)}
            onDoubleClick={() => onOpenRow(i)}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = "#0f0f0f";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = "transparent";
            }}
          >
            <div style={{ color: "#444", fontSize: 13, textAlign: "center" }}>📄</div>
            <div>
              <div style={{ color: isSelected ? "#4ade80" : "#888", fontSize: 12, transition: "color 0.1s" }}>
                {getRowName(row)}
              </div>
              <div
                style={{
                  color: "#444",
                  fontSize: 10,
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 380,
                }}
              >
                {getPreview(row)}
              </div>
            </div>
          </div>
        );
      })}
      {rows.length >= 50 && (
        <div style={{ color: "#333", fontSize: 11, padding: "6px 0" }}>
          showing first 50 rows
        </div>
      )}
    </div>
  );
}
