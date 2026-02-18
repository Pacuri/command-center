"use client";

interface FieldViewerProps {
  row: Record<string, unknown>;
}

export default function FieldViewer({ row }: FieldViewerProps) {
  return (
    <div style={{ color: "#999", fontSize: 12, lineHeight: 1.7 }}>
      {Object.entries(row).map(([key, value]) => {
        const isNull = value === null || value === undefined;
        return (
          <div key={key} style={{ marginBottom: 12 }}>
            <div
              style={{
                color: "#4ade80",
                fontSize: 10,
                letterSpacing: "0.5px",
                marginBottom: 2,
              }}
            >
              {key}
            </div>
            <div
              style={{
                color: isNull ? "#333" : "#888",
                fontSize: 12,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontStyle: isNull ? "italic" : "normal",
              }}
            >
              {isNull ? "null" : String(value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
