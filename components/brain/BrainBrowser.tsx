"use client";

import { useState, useEffect, useCallback } from "react";
import BrainSVG from "./BrainSVG";
import CategoryNode from "./CategoryNode";
import CCStrip from "./CCStrip";
import Popup, { type PopupState } from "./Popup";
import FinderGrid from "./FinderGrid";
import FileList from "./FileList";
import FieldViewer from "./FieldViewer";
import SidebarPreview from "./SidebarPreview";

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
  selectedIndex?: number; // track selection in file list for sidebar preview
}

interface InternalPopup extends PopupState {
  navStack: NavLevel[];
  navIndex: number; // current position in navStack (for forward history)
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

  function openPopupAt(x: number, y: number, nav: NavLevel, titleIcon: string, title: string): string {
    const id = `popup-${++popupCounter}`;
    topZ++;
    const isFinder = nav.level === "category";
    const popup: InternalPopup = {
      id,
      x: Math.min(x + 20, window.innerWidth - 580),
      y: Math.max(Math.min(y - 60, window.innerHeight - 500), 10),
      w: isFinder ? 400 : 560,
      h: isFinder ? 340 : 420,
      zIndex: topZ,
      isFinder,
      title,
      titleIcon,
      breadcrumbs: [],
      canGoBack: false,
      canGoForward: false,
      navStack: [nav],
      navIndex: 0,
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

  function movePopup(id: string, x: number, y: number) {
    setPopups((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  }

  function resizePopup(id: string, w: number, h: number) {
    setPopups((prev) => prev.map((p) => (p.id === id ? { ...p, w, h } : p)));
  }

  // Navigate forward: push new nav, truncate any forward history
  function navigatePopup(id: string, nav: NavLevel) {
    setPopups((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newStack = [...p.navStack.slice(0, p.navIndex + 1), nav];
        return { ...p, navStack: newStack, navIndex: newStack.length - 1 };
      })
    );
  }

  // Navigate back (breadcrumb click or back button)
  function navigateBack(id: string, toIndex?: number) {
    setPopups((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const target = toIndex !== undefined ? toIndex : p.navIndex - 1;
        if (target < 0) return p;
        return { ...p, navIndex: target };
      })
    );
  }

  // Navigate forward (forward button)
  function navigateForward(id: string) {
    setPopups((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.navIndex >= p.navStack.length - 1) return p;
        return { ...p, navIndex: p.navIndex + 1 };
      })
    );
  }

  // Update selected index in current nav (for sidebar preview)
  function setSelectedIndex(id: string, index: number) {
    setPopups((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newStack = [...p.navStack];
        newStack[p.navIndex] = { ...newStack[p.navIndex], selectedIndex: index };
        return { ...p, navStack: newStack };
      })
    );
  }

  // ── Event handlers ──

  function handleCategoryClick(catId: string, e: React.MouseEvent) {
    e.stopPropagation(); // don't trigger closeAll
    // One popup per category — if already open, bring to front
    const existing = popups.find((p) => p.navStack[0].categoryId === catId);
    if (existing) {
      bringToFront(existing.id);
      return;
    }
    const cat = CATEGORIES[catId];
    openPopupAt(e.clientX, e.clientY, { level: "category", categoryId: catId }, cat.icon, cat.label);
  }

  function handleCCTableClick(schema: string, table: string, e: React.MouseEvent) {
    e.stopPropagation(); // don't trigger closeAll
    // One popup per table — if already open, bring to front
    const existing = popups.find((p) => p.navStack[0].schema === schema && p.navStack[0].table === table);
    if (existing) {
      bringToFront(existing.id);
      return;
    }
    fetchTable(schema, table);
    openPopupAt(e.clientX, e.clientY, { level: "table", schema, table }, "📁", `${schema}.${table}`);
  }

  // ── Popup rendering ──

  function buildBreadcrumbs(popup: InternalPopup): PopupState["breadcrumbs"] {
    return popup.navStack.slice(0, popup.navIndex + 1).map((nav, i) => {
      const isLast = i === popup.navIndex;
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
    const current = popup.navStack[popup.navIndex];
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

  function renderSidebar(popup: InternalPopup): React.ReactNode | undefined {
    const current = popup.navStack[popup.navIndex];

    // Show sidebar preview when on a table view with a selected row
    if (current.level === "table" && current.schema && current.table) {
      const key = `${current.schema}.${current.table}`;
      const detail = tableData[key];
      if (detail && current.selectedIndex !== undefined) {
        const row = detail.rows[current.selectedIndex];
        return <SidebarPreview row={row || null} tableName={current.table} />;
      }
      return <SidebarPreview row={null} />;
    }

    return undefined;
  }

  function renderPopupContent(popup: InternalPopup) {
    const current = popup.navStack[popup.navIndex];

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
          selectedIndex={current.selectedIndex}
          onSelectRow={(index) => {
            setSelectedIndex(popup.id, index);
          }}
          onOpenRow={(index) => {
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

  function closeAllPopups() {
    setPopups([]);
  }

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 92px)",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={closeAllPopups}
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
        const canGoBack = popup.navIndex > 0;
        const canGoForward = popup.navIndex < popup.navStack.length - 1;
        const sidebar = renderSidebar(popup);
        return (
          <Popup
            key={popup.id}
            popup={{ ...popup, title, titleIcon: icon, breadcrumbs, canGoBack, canGoForward }}
            onClose={closePopup}
            onBringToFront={bringToFront}
            onMove={movePopup}
            onResize={resizePopup}
            onBack={navigateBack}
            onForward={navigateForward}
            sidebar={sidebar}
          >
            {renderPopupContent(popup)}
          </Popup>
        );
      })}
    </div>
  );
}
