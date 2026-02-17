import { db } from "./db";
import { tasks, events, projects, inbox, focus } from "./schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";

// ── Tasks ──

export async function getOpenTasks() {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.status, "open"))
    .orderBy(
      sql`CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 WHEN 'low' THEN 3 END`,
      asc(tasks.dueDate)
    );
}

export async function getAllTasks(status?: string) {
  if (status) {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.status, status))
      .orderBy(desc(tasks.createdAt));
  }
  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function createTask(data: {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  category?: string;
  createdBy?: string;
}) {
  const [task] = await db
    .insert(tasks)
    .values({
      title: data.title,
      description: data.description || null,
      priority: data.priority || "normal",
      dueDate: data.dueDate || null,
      category: data.category || null,
      createdBy: data.createdBy || "agent",
    })
    .returning();
  return task;
}

export async function updateTask(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    priority: string;
    status: string;
    dueDate: string;
    category: string;
  }>
) {
  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) values.title = data.title;
  if (data.description !== undefined) values.description = data.description;
  if (data.priority !== undefined) values.priority = data.priority;
  if (data.dueDate !== undefined) values.dueDate = data.dueDate;
  if (data.category !== undefined) values.category = data.category;
  if (data.status !== undefined) {
    values.status = data.status;
    if (data.status === "done") values.completedAt = new Date();
  }

  const [task] = await db
    .update(tasks)
    .set(values)
    .where(eq(tasks.id, id))
    .returning();
  return task;
}

export async function completeTask(id: number) {
  return updateTask(id, { status: "done" });
}

export async function deleteTask(id: number) {
  await db.delete(tasks).where(eq(tasks.id, id));
}

// ── Events ──

export async function getEvents(fromDate?: string) {
  const from = fromDate || new Date().toISOString().split("T")[0];
  return db
    .select()
    .from(events)
    .where(gte(events.eventDate, from))
    .orderBy(asc(events.eventDate), asc(events.eventTime));
}

export async function getEventsForMonth(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;
  return db
    .select()
    .from(events)
    .where(and(gte(events.eventDate, start), lte(events.eventDate, end)))
    .orderBy(asc(events.eventDate), asc(events.eventTime));
}

export async function createEvent(data: {
  title: string;
  eventDate: string;
  eventTime?: string;
  durationMin?: number;
  type?: string;
  description?: string;
}) {
  const [event] = await db
    .insert(events)
    .values({
      title: data.title,
      eventDate: data.eventDate,
      eventTime: data.eventTime || null,
      durationMin: data.durationMin || null,
      type: data.type || "meeting",
      description: data.description || null,
    })
    .returning();
  return event;
}

export async function deleteEvent(id: number) {
  await db.delete(events).where(eq(events.id, id));
}

// ── Projects ──

export async function getActiveProjects() {
  return db
    .select()
    .from(projects)
    .where(
      sql`${projects.status} IN ('active', 'planning')`
    )
    .orderBy(desc(projects.updatedAt));
}

export async function getAllProjects() {
  return db.select().from(projects).orderBy(desc(projects.updatedAt));
}

export async function createProject(data: {
  name: string;
  description?: string;
  status?: string;
}) {
  const [project] = await db
    .insert(projects)
    .values({
      name: data.name,
      description: data.description || null,
      status: data.status || "active",
    })
    .returning();
  return project;
}

export async function updateProject(
  id: number,
  data: Partial<{
    name: string;
    description: string;
    status: string;
    progress: number;
  }>
) {
  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) values.name = data.name;
  if (data.description !== undefined) values.description = data.description;
  if (data.status !== undefined) values.status = data.status;
  if (data.progress !== undefined) values.progress = data.progress;

  const [project] = await db
    .update(projects)
    .set(values)
    .where(eq(projects.id, id))
    .returning();
  return project;
}

// ── Inbox ──

export async function getUnreadInbox() {
  return db
    .select()
    .from(inbox)
    .where(eq(inbox.read, false))
    .orderBy(desc(inbox.createdAt));
}

export async function getAllInbox() {
  return db.select().from(inbox).orderBy(desc(inbox.createdAt));
}

export async function pushInbox(data: {
  title: string;
  description?: string;
  source?: string;
}) {
  const [item] = await db
    .insert(inbox)
    .values({
      title: data.title,
      description: data.description || null,
      source: data.source || "agent",
    })
    .returning();
  return item;
}

export async function markInboxRead(id: number) {
  const [item] = await db
    .update(inbox)
    .set({ read: true })
    .where(eq(inbox.id, id))
    .returning();
  return item;
}

// ── Focus ──

export async function getCurrentFocus() {
  const [current] = await db
    .select()
    .from(focus)
    .where(eq(focus.active, true))
    .orderBy(desc(focus.createdAt))
    .limit(1);
  return current || null;
}

export async function setFocus(content: string) {
  // Deactivate all existing
  await db.update(focus).set({ active: false }).where(eq(focus.active, true));
  // Create new
  const [f] = await db
    .insert(focus)
    .values({ content, active: true })
    .returning();
  return f;
}

// ── Agent Status ──

export async function agentHeartbeat() {
  await db.execute(
    sql`UPDATE agent_status SET active = true, last_active = now() WHERE id = 1`
  );
}

export async function getAgentActive(): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT active, last_active FROM agent_status WHERE id = 1`
  );
  const row = (result as any).rows?.[0];
  if (!row) return false;
  // Consider inactive if no heartbeat in 30 seconds
  const lastActive = new Date(row.last_active);
  const stale = Date.now() - lastActive.getTime() > 30000;
  return row.active && !stale;
}

// ── Dashboard Summary ──

export async function getDashboardSummary() {
  const [openTasks, todayEvents, activeProjects, unreadItems, currentFocus, agentActive] =
    await Promise.all([
      getOpenTasks(),
      getEvents(new Date().toISOString().split("T")[0]),
      getActiveProjects(),
      getUnreadInbox(),
      getCurrentFocus(),
      getAgentActive(),
    ]);

  const today = new Date().toISOString().split("T")[0];
  const todayOnly = todayEvents.filter((e) => e.eventDate === today);

  return {
    tasks: openTasks,
    todayEvents: todayOnly,
    upcomingEvents: todayEvents,
    projects: activeProjects,
    inbox: unreadItems,
    focus: currentFocus,
    agentActive,
    counts: {
      openTasks: openTasks.length,
      dueToday: openTasks.filter((t) => t.dueDate === today).length,
      todayEvents: todayOnly.length,
      activeProjects: activeProjects.length,
      unreadInbox: unreadItems.length,
    },
  };
}
