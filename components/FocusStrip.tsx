"use client";

export default function FocusStrip({ content }: { content: string }) {
  return (
    <div
      style={{
        padding: "8px 0",
        marginBottom: 16,
        borderBottom: "1px solid #1a1a1a",
        fontSize: "12px",
      }}
    >
      <span style={{ color: "#8b5cf6" }}>▸ focus</span>{" "}
      <span style={{ color: "#c8c8c8" }}>{content}</span>
    </div>
  );
}
