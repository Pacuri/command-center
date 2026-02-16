export async function sendNotification(data: {
  type: "task_urgent" | "task_done" | "inbox_new";
  title: string;
  description?: string;
  priority?: string;
}) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        dashboard_url: process.env.NEXT_PUBLIC_APP_URL || "",
      }),
    });
  } catch (e) {
    // Fire-and-forget: don't block on notification failure
    console.error("[notify] webhook failed:", e);
  }
}
