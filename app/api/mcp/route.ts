import { NextRequest, NextResponse } from "next/server";
import {
  createTask,
  updateTask,
  completeTask,
  createEvent,
  createProject,
  updateProject,
  pushInbox,
  setFocus,
  getDashboardSummary,
  agentHeartbeat,
} from "@/lib/queries";
import { sendNotification } from "@/lib/notify";
import { verifyMcpAuth } from "@/lib/auth";

// MCP tool definitions
const TOOLS = [
  {
    name: "create_task",
    description: "Create a new task for Nikola",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Task title" },
        description: { type: "string", description: "Task details" },
        priority: {
          type: "string",
          enum: ["urgent", "high", "normal", "low"],
          description: "Task priority level",
        },
        due_date: {
          type: "string",
          description: "Due date in YYYY-MM-DD format",
        },
        category: { type: "string", description: "Task category tag" },
      },
      required: ["title"],
    },
  },
  {
    name: "update_task",
    description: "Update an existing task",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Task ID" },
        title: { type: "string" },
        description: { type: "string" },
        priority: { type: "string", enum: ["urgent", "high", "normal", "low"] },
        status: { type: "string", enum: ["open", "done"] },
        due_date: { type: "string" },
        category: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as done",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Task ID to complete" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_event",
    description: "Add a calendar event (meeting, deadline, milestone)",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Event title" },
        event_date: {
          type: "string",
          description: "Date in YYYY-MM-DD format",
        },
        event_time: { type: "string", description: "Time in HH:MM format" },
        duration_min: { type: "number", description: "Duration in minutes" },
        type: {
          type: "string",
          enum: ["meeting", "deadline", "milestone"],
          description: "Event type",
        },
        description: { type: "string" },
      },
      required: ["title", "event_date"],
    },
  },
  {
    name: "create_project",
    description: "Create a new project",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Project name" },
        description: { type: "string", description: "Project description" },
        status: {
          type: "string",
          enum: ["active", "planning", "paused"],
          description: "Project status",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "update_project",
    description: "Update a project's status or progress",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Project ID" },
        name: { type: "string" },
        description: { type: "string" },
        status: {
          type: "string",
          enum: ["active", "planning", "paused", "done"],
        },
        progress: {
          type: "number",
          description: "Progress percentage (0-100)",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "push_inbox",
    description: "Push a notification to Nikola's inbox",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Inbox item title" },
        description: { type: "string", description: "Details" },
        source: {
          type: "string",
          enum: ["agent", "system"],
          description: "Source of the item",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "set_focus",
    description: "Set the daily focus message shown at the top of dashboard",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "Focus message for the day",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "get_summary",
    description:
      "Get the current dashboard state (tasks, events, projects, inbox)",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

const SERVER_INFO = {
  name: "command-center",
  version: "0.1.0",
};

export async function GET(request: NextRequest) {
  if (!verifyMcpAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ...SERVER_INFO,
    description: "Nikola's personal command center dashboard",
    tools: TOOLS,
  });
}

export async function POST(request: NextRequest) {
  if (!verifyMcpAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { method, id: reqId } = body;

  // Notifications have no id and expect no response (but we return 200 to be safe)
  if (method === "notifications/initialized" || method === "initialized") {
    return new NextResponse(null, { status: 200 });
  }

  // Handle MCP protocol methods
  if (method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: reqId,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      },
    });
  }

  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: reqId,
      result: { tools: TOOLS },
    });
  }

  if (method === "tools/call") {
    const { name, arguments: args } = body.params;
    try {
      // Heartbeat: mark agent as active on every tool call
      agentHeartbeat().catch(() => {});
      const result = await executeTool(name, args || {});
      return NextResponse.json({
        jsonrpc: "2.0",
        id: reqId,
        result: {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        },
      });
    } catch (e: any) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: reqId,
        error: { code: -32000, message: e.message },
      });
    }
  }

  // Ping/pong for health checks
  if (method === "ping") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: reqId,
      result: {},
    });
  }

  return NextResponse.json({
    jsonrpc: "2.0",
    id: reqId,
    error: { code: -32601, message: `Unknown method: ${method}` },
  });
}

async function executeTool(name: string, args: Record<string, any>) {
  switch (name) {
    case "create_task": {
      const task = await createTask({
        title: args.title,
        description: args.description,
        priority: args.priority,
        dueDate: args.due_date,
        category: args.category,
        createdBy: "agent",
      });
      if (task.priority === "urgent") {
        sendNotification({
          type: "task_urgent",
          title: task.title,
          description: task.description || undefined,
          priority: task.priority,
        });
      }
      return { ok: true, task };
    }

    case "update_task": {
      const { id, ...fields } = args;
      const task = await updateTask(id, {
        title: fields.title,
        description: fields.description,
        priority: fields.priority,
        status: fields.status,
        dueDate: fields.due_date,
        category: fields.category,
      });
      return { ok: true, task };
    }

    case "complete_task": {
      const task = await completeTask(args.id);
      return { ok: true, task };
    }

    case "create_event": {
      const event = await createEvent({
        title: args.title,
        eventDate: args.event_date,
        eventTime: args.event_time,
        durationMin: args.duration_min,
        type: args.type,
        description: args.description,
      });
      return { ok: true, event };
    }

    case "create_project": {
      const project = await createProject({
        name: args.name,
        description: args.description,
        status: args.status,
      });
      return { ok: true, project };
    }

    case "update_project": {
      const { id, ...fields } = args;
      const project = await updateProject(id, fields);
      return { ok: true, project };
    }

    case "push_inbox": {
      const item = await pushInbox({
        title: args.title,
        description: args.description,
        source: args.source,
      });
      if (item.source === "agent") {
        sendNotification({
          type: "inbox_new",
          title: item.title,
          description: item.description || undefined,
        });
      }
      return { ok: true, item };
    }

    case "set_focus": {
      const f = await setFocus(args.content);
      return { ok: true, focus: f };
    }

    case "get_summary": {
      const summary = await getDashboardSummary();
      return summary;
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
