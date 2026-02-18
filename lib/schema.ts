import {
  pgSchema,
  serial,
  text,
  date,
  time,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

// All CC tables live in the "cc" schema
const cc = pgSchema("cc");

export const tasks = cc.table(
  "tasks",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    priority: text("priority").notNull().default("normal"),
    status: text("status").notNull().default("open"),
    dueDate: date("due_date"),
    category: text("category"),
    createdBy: text("created_by").notNull().default("agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_cc_tasks_status").on(table.status),
    index("idx_cc_tasks_priority").on(table.priority),
    index("idx_cc_tasks_due").on(table.dueDate),
  ]
);

export const events = cc.table(
  "events",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    eventDate: date("event_date").notNull(),
    eventTime: time("event_time"),
    durationMin: integer("duration_min"),
    type: text("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_cc_events_date").on(table.eventDate)]
);

export const projects = cc.table(
  "projects",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull().default("active"),
    progress: integer("progress").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_cc_projects_status").on(table.status)]
);

export const inbox = cc.table(
  "inbox",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    source: text("source").notNull().default("agent"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_cc_inbox_read").on(table.read)]
);

export const focus = cc.table("focus", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
