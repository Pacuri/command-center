"use client";

interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: string;
  progress: number;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "#1a3a2a", color: "#4ade80", label: "ACTIVE" },
  planning: { bg: "#1a2030", color: "#3b82f6", label: "PLAN" },
  paused: { bg: "#2a2510", color: "#eab308", label: "PAUSED" },
  done: { bg: "#1a1a1a", color: "#555", label: "DONE" },
};

export default function ProjectRow({ project }: { project: Project }) {
  const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 15,
        padding: "9px 0",
        borderBottom: "1px solid #111",
      }}
    >
      <span style={{ flex: 1, color: "#c8c8c8", fontSize: "17px" }}>
        {project.name}
      </span>
      <div
        style={{
          width: 88,
          height: 5,
          background: "#1a1a1a",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${project.progress}%`,
            background: config.color,
            borderRadius: 2,
          }}
        />
      </div>
      <span
        style={{
          width: 42,
          textAlign: "right",
          color: "#333",
          fontSize: "15px",
        }}
      >
        {project.progress}%
      </span>
      <span
        style={{
          fontSize: "14px",
          padding: "2px 8px",
          borderRadius: 2,
          lineHeight: "24px",
          background: config.bg,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    </div>
  );
}
