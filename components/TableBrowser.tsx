"use client";

import { useState, useEffect } from "react";
import FieldViewer from "./brain/FieldViewer";

interface TableInfo {
  table_schema: string;
  table_name: string;
  column_count: number;
  row_count: number;
}

interface TableDetail {
  schema: string;
  table: string;
  columns: { column_name: string; data_type: string; is_nullable: string }[];
  rows: Record<string, any>[];
}

const DOMAIN_MAP: Record<string, string> = {
  cc: "command center",
  public: "claude's life",
};

const TABLE_ICONS: Record<string, string> = {
  soul: "🫀", identity: "🪞", user_profile: "👤", instance_persona: "🎭",
  memory: "🧠", opinions: "💭", agents: "🤖",
  mistakes: "⚡", growth_log: "🌱", daily_logs: "📝",
  heartbeat: "💓", handoffs: "🤝", tools: "🔧",
  tasks: "📋", events: "📅", projects: "◎",
  inbox: "▽", focus: "◉", agent_status: "💚",
};

function getPreviewColumns(schema: string, table: string): string[] {
  const key = `${schema}.${table}`;
  const map: Record<string, string[]> = {
    "cc.tasks": ["title", "priority", "status"],
    "cc.events": ["title", "event_date", "type"],
    "cc.projects": ["name", "status", "progress"],
    "cc.inbox": ["title", "source"],
    "cc.focus": ["content"],
    "cc.agent_status": ["active", "last_active"],
    "public.memory": ["key", "category"],
    "public.soul": ["content"],
    "public.identity": ["content"],
    "public.agents": ["content"],
    "public.daily_logs": ["log_date", "content"],
    "public.handoffs": ["name", "status"],
    "public.mistakes": ["what", "pattern", "recurrence"],
    "public.opinions": ["domain", "stance", "confidence"],
    "public.heartbeat": ["task", "status", "priority"],
    "public.instance_persona": ["name", "handoff_id"],
    "public.growth_log": ["source_table", "change_type"],
  };
  return map[key] || [];
}

function rowName(row: Record<string, any>): string {
  const v = row.title || row.name || row.key || row.task || row.stance || row.what || row.log_date || row.domain || `#${row.id ?? "?"}`;
  const s = String(v);
  return s.length > 40 ? s.slice(0, 40) + "…" : s;
}

function truncate(val: any, max: number = 80): string {
  if (val === null || val === undefined) return "—";
  const s = String(val);
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export default function TableBrowser() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [details, setDetails] = useState<Record<string, TableDetail>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((data) => setTables(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const selectTable = async (schema: string, name: string) => {
    const key = `${schema}.${name}`;
    setSelectedTable(key);
    setSelectedRow(null);
    if (!details[key] && !loading.has(key)) {
      setLoading((prev) => new Set(prev).add(key));
      try {
        const res = await fetch(`/api/tables/${key}`);
        const data = await res.json();
        setDetails((prev) => ({ ...prev, [key]: data }));
      } catch { /* silent */ }
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // Group by schema
  const grouped: Record<string, TableInfo[]> = {};
  for (const t of tables) {
    if (!grouped[t.table_schema]) grouped[t.table_schema] = [];
    grouped[t.table_schema].push(t);
  }
  const sortedSchemas = ["cc", "public"].filter((s) => grouped[s]);

  const detail = selectedTable ? details[selectedTable] : null;
  const isLoading = selectedTable ? loading.has(selectedTable) : false;
  const previewCols = detail ? getPreviewColumns(detail.schema, detail.table) : [];
  const selectedRowData = detail && selectedRow !== null ? detail.rows[selectedRow] : null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 92px)", overflow: "hidden" }}>
      {/* Left — table list */}
      <div
        style={{
          width: 220, flexShrink: 0,
          borderRight: "1px solid #1a1a1a",
          overflowY: "auto",
          padding: "12px 0",
        }}
      >
        {sortedSchemas.map((schema) => (
          <div key={schema} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                color: "#333", padding: "4px 16px 8px",
              }}
            >
              {DOMAIN_MAP[schema] || schema}
            </div>
            {grouped[schema].map((t) => {
              const key = `${t.table_schema}.${t.table_name}`;
              const active = selectedTable === key;
              return (
                <div
                  key={key}
                  onClick={() => selectTable(t.table_schema, t.table_name)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 16px",
                    cursor: "pointer",
                    background: active ? "#111" : "transparent",
                    borderLeft: active ? "2px solid #4ade80" : "2px solid transparent",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#0a0a0a"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 14, flexShrink: 0 }}>
                    {TABLE_ICONS[t.table_name] || "📁"}
                  </span>
                  <span style={{ fontSize: 13, color: active ? "#ccc" : "#777", flex: 1 }}>
                    {t.table_name}
                  </span>
                  <span style={{ fontSize: 10, color: "#333" }}>
                    {t.row_count}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
        {tables.length === 0 && (
          <div style={{ color: "#333", fontSize: 12, padding: "8px 16px" }}>loading…</div>
        )}
      </div>

      {/* Middle — row list */}
      <div
        style={{
          width: 300, flexShrink: 0,
          borderRight: "1px solid #1a1a1a",
          overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}
      >
        {selectedTable && (
          <div
            style={{
              padding: "10px 14px", borderBottom: "1px solid #1a1a1a",
              fontSize: 12, color: "#555", flexShrink: 0,
              display: "flex", justifyContent: "space-between",
            }}
          >
            <span>{detail?.table || selectedTable.split(".")[1]}</span>
            <span>{detail?.rows?.length ?? "…"} rows</span>
          </div>
        )}
        {isLoading && !detail && (
          <div style={{ color: "#444", fontSize: 12, padding: "16px 14px" }}>loading…</div>
        )}
        {detail && detail.rows.length === 0 && (
          <div style={{ color: "#333", fontSize: 12, padding: "16px 14px" }}>empty table</div>
        )}
        {detail && detail.rows.map((row, i) => {
          const active = selectedRow === i;
          return (
            <div
              key={i}
              onClick={() => setSelectedRow(i)}
              style={{
                padding: "8px 14px",
                cursor: "pointer",
                background: active ? "#0f1f0f" : "transparent",
                borderBottom: "1px solid #0d0d0d",
                borderLeft: active ? "2px solid #4ade80" : "2px solid transparent",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#0a0a0a"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ fontSize: 13, color: active ? "#ddd" : "#999", marginBottom: 2 }}>
                {rowName(row)}
              </div>
              <div style={{ fontSize: 11, color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {previewCols.slice(0, 2).map((col) => truncate(row[col], 40)).join(" · ")}
              </div>
            </div>
          );
        })}
        {!selectedTable && (
          <div style={{ color: "#333", fontSize: 12, padding: "24px 14px", textAlign: "center" }}>
            select a table
          </div>
        )}
      </div>

      {/* Right — detail view */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {selectedRowData ? (
          <FieldViewer row={selectedRowData as Record<string, unknown>} />
        ) : selectedTable && detail ? (
          <div style={{ color: "#333", fontSize: 13, paddingTop: 24, textAlign: "center" }}>
            select a row to view
          </div>
        ) : !selectedTable ? (
          <div style={{ color: "#333", fontSize: 13, paddingTop: 24, textAlign: "center" }}>
            select a table from the left
          </div>
        ) : null}
      </div>
    </div>
  );
}
