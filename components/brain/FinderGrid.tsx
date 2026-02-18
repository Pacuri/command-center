"use client";

interface FinderGridProps {
  items: Array<{
    table: string;
    icon: string;
    name: string;
    rowCount: number;
  }>;
  onSelect: (table: string) => void;
}

export default function FinderGrid({ items, onSelect }: FinderGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
        gap: 6,
        padding: 4,
      }}
    >
      {items.map((item) => (
        <div
          key={item.table}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "10px 6px",
            borderRadius: 6,
            cursor: "pointer",
            transition: "background 0.1s",
            textAlign: "center",
          }}
          onClick={() => onSelect(item.table)}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#151515")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div style={{ fontSize: 28, marginBottom: 5 }}>{item.icon}</div>
          <div
            style={{
              fontSize: 10,
              color: "#888",
              wordBreak: "break-word",
              lineHeight: 1.3,
            }}
          >
            {item.name}
          </div>
          <div style={{ fontSize: 9, color: "#333", marginTop: 2 }}>
            {item.rowCount} row{item.rowCount !== 1 ? "s" : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
