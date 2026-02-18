"use client";

import TableNode from "./TableNode";

interface TableInfo {
  table_schema: string;
  table_name: string;
  row_count: number;
}

const CC_TABLES = [
  { name: "tasks", icon: "📋", label: "tasks" },
  { name: "events", icon: "📅", label: "events" },
  { name: "projects", icon: "◎", label: "projects" },
  { name: "inbox", icon: "▽", label: "inbox" },
  { name: "focus", icon: "◉", label: "focus" },
  { name: "agent_status", icon: "💚", label: "status" },
];

interface CCStripProps {
  tables: TableInfo[];
  onTableClick: (schema: string, table: string, e: React.MouseEvent) => void;
}

export default function CCStrip({ tables, onTableClick }: CCStripProps) {
  function getCount(name: string): number {
    const t = tables.find((t) => t.table_schema === "cc" && t.table_name === name);
    return t?.row_count ?? 0;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#333",
          marginBottom: 4,
          textAlign: "center",
        }}
      >
        ── cc ──
      </div>
      {CC_TABLES.map((t) => (
        <TableNode
          key={t.name}
          icon={t.icon}
          label={t.label}
          rowCount={getCount(t.name)}
          onClick={(e) => onTableClick("cc", t.name, e)}
        />
      ))}
    </div>
  );
}
