"use client";

import { useState, useEffect } from "react";
import TableCard from "./TableCard";

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

// Domain grouping
const DOMAIN_MAP: Record<string, string> = {
  "cc": "command center",
  "public": "claude's life",
};

// Which columns to show as preview for known tables
function getPreviewColumns(schema: string, table: string): string[] {
  const key = `${schema}.${table}`;
  const map: Record<string, string[]> = {
    "cc.tasks": ["title", "priority", "status", "due_date"],
    "cc.events": ["title", "event_date", "event_time", "type"],
    "cc.projects": ["name", "status", "progress"],
    "cc.inbox": ["title", "source", "read"],
    "cc.focus": ["content", "active"],
    "cc.agent_status": ["active", "last_active"],
    "public.memory": ["key", "category", "content"],
    "public.soul": ["content"],
    "public.identity": ["content"],
    "public.agents": ["content"],
    "public.daily_logs": ["log_date", "content"],
    "public.handoffs": ["name", "status"],
    "public.mistakes": ["what", "pattern", "recurrence", "status"],
    "public.opinions": ["domain", "stance", "confidence"],
    "public.heartbeat": ["task", "status", "priority"],
    "public.instance_persona": ["name", "handoff_id"],
    "public.growth_log": ["source_table", "change_type", "description"],
  };
  return map[key] || [];
}

function truncate(val: any, max: number = 60): string {
  if (val === null || val === undefined) return "—";
  const s = String(val);
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export default function TableBrowser() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [openTable, setOpenTable] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, TableDetail>>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((data) => setTables(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const toggleTable = async (schema: string, name: string) => {
    const key = `${schema}.${name}`;
    if (openTable === key) {
      setOpenTable(null);
      return;
    }
    setOpenTable(key);

    if (!details[key]) {
      setLoading(key);
      try {
        const res = await fetch(`/api/tables/${key}`);
        const data = await res.json();
        setDetails((prev) => ({ ...prev, [key]: data }));
      } catch {
        // silent
      }
      setLoading(null);
    }
  };

  // Group by schema
  const grouped: Record<string, TableInfo[]> = {};
  for (const t of tables) {
    const schema = t.table_schema;
    if (!grouped[schema]) grouped[schema] = [];
    grouped[schema].push(t);
  }

  // Show cc first, then public
  const schemaOrder = ["cc", "public"];
  const sortedSchemas = Object.keys(grouped).sort(
    (a, b) => (schemaOrder.indexOf(a) === -1 ? 99 : schemaOrder.indexOf(a)) -
              (schemaOrder.indexOf(b) === -1 ? 99 : schemaOrder.indexOf(b))
  );

  return (
    <div>
      {sortedSchemas.map((schema) => (
        <div key={schema} style={{ marginBottom: 32 }}>
          {/* Schema header */}
          <div
            style={{
              color: "#555",
              fontSize: 12,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: "6px 0 10px",
              borderBottom: "1px solid #1a1a1a",
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>── {DOMAIN_MAP[schema] || schema} ──</span>
            <span>{grouped[schema].length} table{grouped[schema].length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {grouped[schema].map((t) => {
              const key = `${t.table_schema}.${t.table_name}`;
              const isOpen = openTable === key;
              const detail = details[key];
              const isLoading = loading === key;
              const previewCols = getPreviewColumns(t.table_schema, t.table_name);

              return (
                <TableCard
                  key={key}
                  table={t}
                  isOpen={isOpen}
                  onToggle={() => toggleTable(t.table_schema, t.table_name)}
                >
                  {isLoading && (
                    <div style={{ color: "#444", fontSize: 12, padding: "8px 0" }}>
                      loading…
                    </div>
                  )}
                  {detail && detail.rows && (
                    <div style={{ paddingTop: 8 }}>
                      {/* Column headers */}
                      {previewCols.length > 0 && detail.rows.length > 0 && (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: `40px ${previewCols.map(() => "1fr").join(" ")}`,
                            gap: 8,
                            padding: "4px 0 6px",
                            borderBottom: "1px solid #111",
                            marginBottom: 2,
                          }}
                        >
                          <span style={{ fontSize: 10, color: "#333" }}>#</span>
                          {previewCols.map((col) => (
                            <span key={col} style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              {col}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Rows */}
                      {detail.rows.length === 0 && (
                        <div style={{ color: "#333", fontSize: 12, padding: "6px 0" }}>
                          empty table
                        </div>
                      )}
                      {detail.rows.map((row, i) => {
                        const cols = previewCols.length > 0
                          ? previewCols
                          : Object.keys(row).slice(0, 4);
                        return (
                          <div
                            key={i}
                            style={{
                              display: "grid",
                              gridTemplateColumns: `40px ${cols.map(() => "1fr").join(" ")}`,
                              gap: 8,
                              padding: "5px 0",
                              borderBottom: "1px solid #0d0d0d",
                              fontSize: 12,
                              alignItems: "start",
                            }}
                          >
                            <span style={{ color: "#333" }}>{row.id ?? i + 1}</span>
                            {cols.map((col) => (
                              <span key={col} style={{ color: "#888", wordBreak: "break-word" }}>
                                {truncate(row[col])}
                              </span>
                            ))}
                          </div>
                        );
                      })}

                      {detail.rows.length >= 50 && (
                        <div style={{ color: "#333", fontSize: 11, padding: "6px 0" }}>
                          showing first 50 rows
                        </div>
                      )}
                    </div>
                  )}
                </TableCard>
              );
            })}
          </div>
        </div>
      ))}

      {tables.length === 0 && (
        <div style={{ color: "#333", fontSize: 13 }}>loading tables…</div>
      )}
    </div>
  );
}
