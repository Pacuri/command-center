import { getAllTasks, getOpenTasks } from "@/lib/queries";
import TasksClient from "./TasksClient";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await getAllTasks();
  return <TasksClient tasks={tasks} />;
}
