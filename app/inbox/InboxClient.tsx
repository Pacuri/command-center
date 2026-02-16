"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";
import InboxRow from "@/components/InboxRow";

export default function InboxClient({
  items,
  unreadCount,
}: {
  items: any[];
  unreadCount: number;
}) {
  const router = useRouter();

  const handleMarkRead = async (id: number) => {
    await fetch(`/api/inbox/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    router.refresh();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar inboxCount={unreadCount} />
      <main style={{ flex: 1, padding: "20px 28px 60px", maxWidth: 920 }}>
        <div style={{ color: "#555", marginBottom: 4, fontSize: "12px" }}>
          <span style={{ color: "#4ade80" }}>nikola</span>
          <span style={{ color: "#333" }}>@cc</span> ~/inbox
        </div>

        <div
          style={{
            color: "#333",
            fontSize: "10px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            padding: "4px 0 8px",
            borderBottom: "1px solid #1a1a1a",
            marginBottom: 2,
            marginTop: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>── inbox ──</span>
          <span>
            {unreadCount} unread · {items.length} total
          </span>
        </div>

        {items.map((item) => (
          <InboxRow
            key={item.id}
            item={item}
            onMarkRead={!item.read ? handleMarkRead : undefined}
          />
        ))}
        {items.length === 0 && (
          <div style={{ color: "#333", padding: "8px 0", fontSize: "11px" }}>
            inbox empty
          </div>
        )}
      </main>
      <StatusBar />
    </div>
  );
}
