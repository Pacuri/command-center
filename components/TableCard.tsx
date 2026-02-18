"use client";

interface TableInfo {
  table_schema: string;
  table_name: string;
  column_count: number;
  row_count: number;
}

interface TableCardProps {
  table: TableInfo;
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export default function TableCard({ table, isOpen, onToggle, children }: TableCardProps) {
  return (
    <div
      style={{
        border: "1px solid #1a1a1a",
        borderRadius: 4,
        overflow: "hidden",
        background: isOpen ? "#0d0d0d" : "transparent",
        transition: "background 0.15s",
      }}
    >
      {/* Header — clickable */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: 16, color: isOpen ? "#4ade80" : "#555" }}>
          {isOpen ? "▾" : "▸"}
        </span>
        <span style={{ fontSize: 15, color: "#4ade80", opacity: 0.7 }}>
          {isOpen ? "📂" : "📁"}
        </span>
        <span style={{ fontSize: 14, color: "#ccc", flex: 1 }}>
          {table.table_name}
        </span>
        <span style={{ fontSize: 11, color: "#444" }}>
          {table.row_count} row{table.row_count !== 1 ? "s" : ""} · {table.column_count} col{table.column_count !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Expanded content */}
      {isOpen && children && (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid #1a1a1a" }}>
          {children}
        </div>
      )}
    </div>
  );
}
