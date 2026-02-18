import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";
import TableBrowser from "@/components/TableBrowser";

export default function TablesPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "24px 32px 64px",
          overflowY: "auto",
          maxWidth: 1100,
        }}
      >
        {/* Prompt */}
        <div style={{ color: "#555", marginBottom: 6, fontSize: "14px" }}>
          <span style={{ color: "#4ade80" }}>nikola</span>
          <span style={{ color: "#333" }}>@cc</span>{" "}
          <span>~/tables</span>
        </div>
        <div style={{ marginBottom: 20, color: "#555", fontSize: "13px" }}>
          database browser · all schemas
        </div>

        <TableBrowser />
      </div>

      <StatusBar counts={{ openTasks: 0, dueToday: 0, todayEvents: 0, activeProjects: 0, unreadInbox: 0 }} />
    </div>
  );
}
