import { getAllProjects } from "@/lib/queries";
import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";
import ProjectRow from "@/components/ProjectRow";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "20px 28px 60px", maxWidth: 920 }}>
        <div style={{ color: "#555", marginBottom: 4, fontSize: "12px" }}>
          <span style={{ color: "#4ade80" }}>nikola</span>
          <span style={{ color: "#333" }}>@cc</span> ~/projects
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
          <span>── projects ──</span>
          <span>{projects.length}</span>
        </div>

        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
        {projects.length === 0 && (
          <div style={{ color: "#333", padding: "8px 0", fontSize: "11px" }}>
            no projects
          </div>
        )}
      </main>
      <StatusBar />
    </div>
  );
}
