"use client";

import { useState, useEffect, useCallback } from "react";
import BrainSVG from "./BrainSVG";
import CategoryNode from "./CategoryNode";
import CCStrip from "./CCStrip";
import Popup, { type PopupState } from "./Popup";
import FinderGrid from "./FinderGrid";
import FileList from "./FileList";
import FieldViewer from "./FieldViewer";

// ── Constants ──

interface Category {
  label: string;
  icon: string;
  tables: string[];
}

const CATEGORIES: Record<string, Category> = {
  identity: { label: "Identity", icon: "🪞", tables: ["soul", "identity", "user_profile", "instance_persona"] },
  memory: { label: "Memory", icon: "🧠", tables: ["memory", "opinions", "agents"] },
  growth: { label: "Growth", icon: "🌱", tables: ["mistakes", "growth_log", "daily_logs"] },
  activity: { label: "Activity", icon: "💓", tables: ["heartbeat", "handoffs", "daily_logs"] },
  config: { label: "Config", icon: "🔧", tables: ["tools"] },
};

const TABLE_ICONS: Record<string, { icon: string; name: string }> = {
  soul: { icon: "🫀", name: "soul" },
  identity: { icon: "🪞", name: "identity" },
  user_profile: { icon: "👤", name: "user_profile" },
  instance_persona: { icon: "🎭", name: "persona" },
  memory: { icon: "🧠", name: "memory" },
  opinions: { icon: "💭", name: "opinions" },
  agents: { icon: "🤖", name: "agents" },
  mistakes: { icon: "⚡", name: "mistakes" },
  growth_log: { icon: "🌱", name: "growth_log" },
  daily_logs: { icon: "📝", name: "daily_logs" },
  heartbeat: { icon: "💓", name: "heartbeat" },
  handoffs: { icon: "🤝", name: "handoffs" },
  tools: { icon: "🔧", name: "tools" },
};

const CATEGORY_POSITIONS: Record<string, React.CSSProperties> = {
  identity: { left: 50, top: 60 },
  memory: { right: 50, top: 60 },
  growth: { left: "50%", top: 190, transform: "translateX(-50%)" },
  activity: { left: 80, top: 310 },
  config: { right: 80, top: 310 },
};

// ── Types ──

interface TableInfo {
  table_schema: string;
  table_name: string;
  column_count: number;
  row_count: number;
}

interface TableDetail {
  schema: string;
  table: string;
  columns: Array<{ column_name: string; data_type: string; is_nullable: string }>;
  rows: Record<string, unknown>[];
}

interface NavLevel {
  level: "category" | "table" | "row";
  categoryId?: string;
  schema?: string;
  table?: string;
  rowIndex?: number;
}

interface InternalPopup extends PopupState {
  navStack: NavLevel[];
}

// ── Component ──

let popupCounter = 0;
let topZ = 1000;

export default function BrainBrowser() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [tableData, setTableData] = useState<Record<string, TableDetail>>({});
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [popups, setPopups] = useState<InternalPopup[]>([]);

  // Fetch table list on mount
  useEffect(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((data) => setTables(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Lazy-fetch table detail
  const fetchTable = useCallback(
    async (schema: string, table: string) => {
      const key = `${schema}.${table}`;
      if (tableData[key] || loadingKeys.has(key)) return;
      setLoadingKeys((prev) => new Set(prev).add(key));
      try {
        const res = await fetch(`/api/tables/${key}`);
        const data = await res.json();
        setTableData((prev) => ({ ...prev, [key]: data }));
      } catch {
        // silent
      }
      setLoadingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    [tableData, loadingKeys]
  );

  // ── Popup helpers ──

  function getCount(schema: string, table: string): number {
    const t = tables.find((t) => t.table_schema === schema && t.table_name === table);
    return t?.row_count ?? 0;
  }

  function openPopupAt(x: number, y: number, nav: NavLevel, isFinder: boolean, titleIcon: string, title: string): string {
    const id = `popup-${++popupCounter}`;
    topZ++;
    const popup: InternalPopup = {
      id,
      x: Math.min(x + 20, window.innerWidth - 540),
      y: Math.max(Math.min(y - 60, window.innerHeight - 500), 10),
      zIndex: topZ,
      isFinder,
      title,
      titleIcon,
      breadcrumbs: [],
      navStack: [nav],
    };
    setPopups((prev) => [...prev, popup]);
    return id;
  }

  function closePopup(id: string) {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }

  function bringToFront(id: string) {
    topZ++;
    setPopups((prev) => prev.map((p) => (p.id === id ? { ...p, zIndex: topZ } : p)));
  }

  function dragMove(id: string, x: number, y: number) {
    setPopups((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  }

  function navigatePopup(id: string, nav: NavLevel) {
    setPopups((prev) =>
      prev.map((p) => (p.id === id ? { ...p, navStack: [...p.navStack, nav] } : p))
    );
  }

  function navigateBack(id: string, toIndex: number) {
    setPopups((prev) =>
      prev.map((p) => (p.id === id ? { ...p, navStack: p.navStack.slice(0, toIndex + 1) } : p))
    );
  }

  // ── Event handlers ──

  function handleCategoryClick(catId: string, e: React.MouseEvent) {
    const cat = CATEGORIES[catId];
    openPopupAt(e.clientX, e.clientY, { level: "category", categoryId: catId }, true, cat.icon, cat.label);
  }

  function handleCCTableClick(schema: string, table: string, e: React.MouseEvent) {
    fetchTable(schema, table);
    openPopupAt(e.clientX, e.clientY, { level: "table", schema, table }, false, "📁", `${schema}.${table}`);
  }

  // ── Popup rendering ──

  function buildBreadcrumbs(popup: InternalPopup): PopupState["breadcrumbs"] {
    return popup.navStack.map((nav, i) => {
      const isLast = i === popup.navStack.length - 1;
      let label = "";
      if (nav.level === "category" && nav.categoryId) {
        label = CATEGORIES[nav.categoryId]?.label || nav.categoryId;
      } else if (nav.level === "table" && nav.table) {
        const meta = TABLE_ICONS[nav.table];
        label = meta?.name || nav.table;
      } else if (nav.level === "row") {
        const key = `${nav.schema}.${nav.table}`;
        const detail = tableData[key];
        if (detail && nav.rowIndex !== undefined) {
          const row = detail.rows[nav.rowIndex];
          const name = String(
            row?.title || row?.name || row?.key || row?.task || row?.stance || row?.what || `row ${nav.rowIndex + 1}`
          );
          label = name.length > 20 ? name.slice(0, 20) + "…" : name;
        } else {
          label = `row ${(nav.rowIndex ?? 0) + 1}`;
        }
      }
      return {
        label,
        onClick: isLast ? undefined : () => navigateBack(popup.id, i),
      };
    });
  }

  function getPopupTitle(popup: InternalPopup): { title: string; icon: string } {
    const current = popup.navStack[popup.navStack.length - 1];
    if (current.level === "category" && current.categoryId) {
      const cat = CATEGORIES[current.categoryId];
      return { title: cat?.label || "", icon: cat?.icon || "📁" };
    }
    if (current.level === "table" && current.table) {
      const meta = TABLE_ICONS[current.table];
      const key = `${current.schema}.${current.table}`;
      const detail = tableData[key];
      const count = detail?.rows?.length ?? getCount(current.schema || "public", current.table);
      return {
        title: `${meta?.name || current.table}  ${count} rows`,
        icon: meta?.icon || "📁",
      };
    }
    if (current.level === "row") {
      const key = `${current.schema}.${current.table}`;
      const detail = tableData[key];
      const row = detail?.rows?.[current.rowIndex ?? 0];
      const name = row
        ? String(row.title || row.name || row.key || row.task || row.stance || row.what || `row ${(current.rowIndex ?? 0) + 1}`)
        : `row ${(current.rowIndex ?? 0) + 1}`;
      const truncated = name.length > 25 ? name.slice(0, 25) + "…" : name;
      return { title: `${truncated}.md`, icon: "📄" };
    }
    return { title: "", icon: "📁" };
  }

  function renderPopupContent(popup: InternalPopup) {
    const current = popup.navStack[popup.navStack.length - 1];

    if (current.level === "category" && current.categoryId) {
      const cat = CATEGORIES[current.categoryId];
      const items = cat.tables.map((t) => ({
        table: t,
        icon: TABLE_ICONS[t]?.icon || "📁",
        name: TABLE_ICONS[t]?.name || t,
        rowCount: getCount("public", t),
      }));
      return (
        <FinderGrid
          items={items}
          onSelect={(table) => {
            fetchTable("public", table);
            navigatePopup(popup.id, {
              level: "table",
              categoryId: current.categoryId,
              schema: "public",
              table,
            });
          }}
        />
      );
    }

    if (current.level === "table" && current.schema && current.table) {
      const key = `${current.schema}.${current.table}`;
      const detail = tableData[key];
      const isLoading = loadingKeys.has(key);
      return (
        <FileList
          rows={detail?.rows ?? []}
          loading={isLoading && !detail}
          onSelectRow={(index) => {
            navigatePopup(popup.id, {
              level: "row",
              categoryId: current.categoryId,
              schema: current.schema,
              table: current.table,
              rowIndex: index,
            });
          }}
        />
      );
    }

    if (current.level === "row" && current.schema && current.table && current.rowIndex !== undefined) {
      const key = `${current.schema}.${current.table}`;
      const detail = tableData[key];
      const row = detail?.rows?.[current.rowIndex];
      if (!row) return <div style={{ color: "#333", fontSize: 12 }}>loading…</div>;
      return <FieldViewer row={row as Record<string, unknown>} />;
    }

    return null;
  }

  // ── Render ──

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 92px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes brain-pulse {
          0%, 100% { opacity: 0.06; }
          50% { opacity: 0.1; }
        }
        @keyframes popup-in {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Brain SVG background */}
      <BrainSVG />

      {/* Brain container: category nodes */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 440,
          height: 400,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -4,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#2a4a2a",
            whiteSpace: "nowrap",
          }}
        >
          ── claude&apos;s life ──
        </div>

        {Object.entries(CATEGORIES).map(([id, cat]) => (
          <CategoryNode
            key={id}
            icon={cat.icon}
            label={cat.label}
            tableCount={cat.tables.length}
            style={CATEGORY_POSITIONS[id]}
            onClick={(e) => handleCategoryClick(id, e)}
          />
        ))}
      </div>

      {/* CC strip */}
      <CCStrip tables={tables} onTableClick={handleCCTableClick} />

      {/* Prompt */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 32,
          fontSize: 13,
          color: "#333",
        }}
      >
        <span style={{ color: "#4ade80" }}>nikola</span>
        <span style={{ color: "#333" }}>@cc</span>
        <span style={{ color: "#555" }}> ~/tables</span>
        <span style={{ color: "#444" }}> · click to open</span>
      </div>

      {/* Popups */}
      {popups.map((popup) => {
        const { title, icon } = getPopupTitle(popup);
        const breadcrumbs = buildBreadcrumbs(popup);
        return (
          <Popup
            key={popup.id}
            popup={{ ...popup, title, titleIcon: icon, breadcrumbs }}
            onClose={closePopup}
            onBringToFront={bringToFront}
            onDragMove={dragMove}
          >
            {renderPopupContent(popup)}
          </Popup>
        );
      })}
    </div>
  );
}
